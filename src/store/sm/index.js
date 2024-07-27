import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Scene, Persona } from '@soulmachines/smwebsdk';
import to from 'await-to-js';
import proxyVideo, { mediaStreamProxy } from '../../proxyVideo';
import roundObject from '../../utils/roundObject';
import { meatballString } from './meatball';

const AUTH_MODE = parseInt(process.env.REACT_APP_PERSONA_AUTH_MODE, 10) || 0;
const API_KEY = process.env.REACT_APP_API_KEY || '';
const TOKEN_ISSUER = process.env.REACT_APP_TOKEN_URL;
const PERSONA_ID = '1';
// CAMERA_ID foi comentado porque CUE gerencia a câmera
// const CAMERA_ID = 'CloseUp';

let startupErr = null;

if (AUTH_MODE === 0 && API_KEY === '') startupErr = { msg: 'REACT_APP_API_KEY not defined!' };

const initialState = {
  requestedMediaPerms: sessionStorage.getItem('requestedMediaPerms')
    ? {
      ...JSON.parse(sessionStorage.getItem('requestedMediaPerms')),
      // as permissões de mídia podem ter sido alteradas antes de recarregar, então defina false para verificarmos novamente
      cameraDenied: false,
      micDenied: false,
    }
    : {
      mic: false,
      micDenied: false,
      camera: false,
      cameraDenied: false,
    },
  tosAccepted: false,
  connected: false,
  disconnected: false,
  sessionID: '',
  // use startAt para medir se alguém inicia uma sessão e depois vai embora
  startedAt: Date.now(),
  presumeTimeout: false,
  loading: false,
  connectionState: {
    name: '',
    percentageLoaded: 0,
  },
  // o valor padrão é nulo, isso nos permite capturar coisas como chaves de API ausentes
  error: startupErr,
  micOn: true,
  cameraOn: true,
  isOutputMuted: false,
  videoHeight: window.innerHeight,
  videoWidth: window.innerWidth,
  transcript: [],
  activeCards: [],
  speechState: 'idle',
  // A PNL nos dá resultados à medida que processa a expressão final do usuário
  intermediateUserUtterance: '',
  userSpeaking: false,
  lastUserUtterance: '',
  lastPersonaUtterance: '',
  user: {
    activity: {
      isAttentive: 0,
      isTalking: 0,
    },
    emotion: {
      confusion: 0,
      negativity: 0,
      positivity: 0,
      confidence: 0,
    },
    conversation: {
      turn: '',
      context: {
        FacePresent: 0,
        PersonaTurn_IsAttentive: 1,
        PersonaTurn_IsTalking: null,
        Persona_Turn_Confusion: null,
        Persona_Turn_Negativity: null,
        Persona_Turn_Positivity: null,
        UserTurn_IsAttentive: 0,
        UserTurn_IsTalking: null,
        User_Turn_Confusion: null,
        User_Turn_Negativity: null,
        User_Turn_Positivity: null,
      },
    },
  },
  callQuality: {
    audio: {
      bitrate: null,
      packetsLost: null,
      roundTripTime: null,
    },
    video: {
      bitrate: null,
      packetsLost: null,
      roundTripTime: null,
    },
  },
  // o padrão é 1 porque esses valores são usados ​​para calcular uma proporção de aspecto,
  // então, se por algum motivo a câmera for desativada, o padrão será um quadrado (1:1)
  cameraWidth: 1,
  cameraHeight: 1,
  showTranscript: false,
  // ativar e desativar recursos para cada nova sessão
  config: {
    autoClearCards: true,
  },
  closeMarker: false,
  highlightMic: false,
  highlightMute: false,
  highlightChat: false,
  highlightMenu: false,
  highlightCamera: false,
  highlightSkip: false,
};

// objeto de ações de host, pois precisamos que os tipos estejam disponíveis para
// chamadas assíncronas mais tarde, por ex. lidar com mensagens de persona
let actions;
let persona = null;
let scene = null;

/**
 * Anime a câmera com as configurações desejadas.
 * Consulte utils/camera.js para obter ajuda com o cálculo.
 *
 * options {
 *   tiltDeg: 0,
 *   orbitDegX: 0,
 *   orbitDegY: 0,
 *   panDeg: 0,
 * }
 */
export const animateCamera = createAsyncThunk('sm/animateCamera', (/* { options, duration } */) => {
  if (!scene) return console.error('cannot animate camera, scene not initiated!');

  const serverControlledCameras = scene.hasServerControlledCameras();
  if (serverControlledCameras) return console.warn('autonomous animation is active, manual camera animations are disabled!');

  return false;
  // const CAMERA_ID = 1;
  // return scene.sendRequest('animateToNamedCamera', {
  //   cameraName: CAMERA_ID,
  //   personaId: PERSONA_ID,
  //   time: duration || 1,
  //   ...options,
  // });
});

// lida com desconexão manual ou tempo limite automático devido à inatividade
export const disconnect = createAsyncThunk('sm/disconnect', async (args, thunk) => {
  const { loading } = thunk.getState();
  if (scene && loading === false) scene.disconnect();
  // espere 500 ms para que a lógica de despacho tenha tempo de executar e se comunicar com o servidor persona
  setTimeout(() => {
    thunk.dispatch(actions.disconnect());
  }, 1);
});

export const createScene = createAsyncThunk('sm/createScene', async (_, thunk) => {
  /* CRIAR CENA */
  if (scene !== null) {
    return console.error('warning! you attempted to create a new scene, when one already exists!');
  }
  // rsolicite permissões do usuário e crie uma instância da cena e solicite permissões de webcam/microfone
  const { requestedMediaPerms } = thunk.getState().sm;
  const { mic, camera } = requestedMediaPerms;

  // retire a configuração de log das variáveis ​​de ambiente
  // podemos querer definir valores diferentes para dev e prod
  const {
    REACT_APP_SMWEBSDK_SESSION_LOGGING_ENABLED: sessionLoggingEnabled,
    REACT_APP_SMWEBSDK_SESSION_LOGGING_LEVEL: sessionLoggingLevel,
    REACT_APP_SMWEBSDK_CONTENT_AWARENESS_LOGGING_ENABLED: cueLoggingEnabled,
    REACT_APP_SMWEBSDK_CONTENT_AWARENESS_LOGGING_LEVEL: cueLoggingLevel,
  } = process.env;

  try {
    const sceneOpts = {
      videoElement: proxyVideo,
      // alternância apenas de áudio, mas isso é definido automaticamente se o usuário negar permissões de câmera.
      // altere o valor se seu aplicativo precisar ter um modo somente áudio explícito.
      audioOnly: false,
      // permissões solicitadas
      requestedMediaDevices: {
        microphone: mic,
        camera,
      },
      // permissões necessárias. podemos executar apenas no modo de digitação, então nada está bem
      requiredMediaDevices: {
        microphone: false,
        camera: false,
      },
      loggingConfig: {
        session: {
          enabled: sessionLoggingEnabled || true,
          minLogLevel: sessionLoggingLevel || 'debug',
        },
        contentAwareness: {
          enabled: cueLoggingEnabled || true,
          minLogLevel: cueLoggingLevel || 'debug',
        },
      },
      sendMetadata: {
        // enviar atualizações de URL para o aplicativo react como intenções PAGE_METADATA para PNL
        pageUrl: false,
      },
      stopSpeakingWhenNotVisible: true,
    };
    if (AUTH_MODE === 0) sceneOpts.apiKey = API_KEY;
    scene = new Scene(sceneOpts);
  } catch (e) {
    return thunk.rejectWithValue(e);
  }

  // verifique se o usuário negou permissões
  // em caso afirmativo, continue digitando apenas, mas defina mic/cameraDenied como true
  let cameraDenied = false;
  let micDenied = false;
  try {
    await navigator.mediaDevices.getUserMedia({ micDenied: false, cameraDenied: false });
  } catch {
    cameraDenied = false;
    micDenied = false;
  }

  try {
    await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
  } catch {
    cameraDenied = true;
    micDenied = false;
  }
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  } catch {
    micDenied = true;
    cameraDenied = false;
  }

  thunk.dispatch(actions.setRequestedMediaPerms({
    camera,
    mic,
    cameraDenied,
    micDenied,
  }));

  // reflete o status do microfone e da câmera na loja redux
  thunk.dispatch(actions.setMediaDevices({
    micOn: micDenied ? false : mic,
    cameraOn: cameraDenied ? false : camera,
  }));

  /* MANIPULADORES DE LIGAÇÃO */
  // estado da conexão/manipulador de progresso
  scene.connectionState.onConnectionStateUpdated.addListener(
    (connectionStateData) => {
      thunk.dispatch(actions.setConnectionState({ ...connectionStateData }));
    },
  );
  // manipulador de desconexão
  scene.onDisconnected = () => thunk.dispatch(disconnect());
  // armazene uma referência no smwebsdk onmessage para que possamos
  // use o retorno de chamada enquanto chama a versão interna
  const smwebsdkOnMessage = scene.onMessage.bind(scene);

  const { sm } = thunk.getState();
  const { autoClearCards } = sm.config;
  scene.conversation.autoClearCards = autoClearCards;
  //lidar com cartões de conteúdo que chegam por meio da API de cartão de conteúdo
  scene.conversation.onCardChanged.addListener((activeCards) => {
    thunk.dispatch(actions.setActiveCards({ activeCards }));
    thunk.dispatch(actions.addConversationResult({
      source: 'persona',
      card: activeCards[activeCards.length - 1],
    }));
  });

  scene.onMessage = (message) => {
    // remover isso interromperá o evento smwebsdk, chame o manipulador de mensagens do smwebsdk
    smwebsdkOnMessage(message);
    switch (message.name) {
      // lida com a saída do TTS (o que o usuário disse)
      case ('recognizeResults'): {
        const output = message.body.results[0];
        // às vezes recebemos uma mensagem vazia, capturamos e registramos
        if (!output) {
          console.warn('undefined output!', message.body);
          return false;
        }
        const { transcript: text } = output.alternatives[0];
        // recebemos várias mensagens de resultados de reconhecimento, então adicione apenas a última à transcrição
        // mas acompanhe o intermediário para mostrar ao usuário o que ele está dizendo
        if (output.final === false) {
          return thunk.dispatch(actions.setIntermediateUserUtterance({
            text,
          }));
        }
        return thunk.dispatch(actions.addConversationResult({
          source: 'user',
          text,
        }));
      }

      // lida com a saída da PNL (o que DP está dizendo)
      case ('personaResponse'): {
        const { currentSpeech } = message.body;
        thunk.dispatch(actions.addConversationResult({
          source: 'persona',
          text: currentSpeech,
        }));
        break;
      }

      // lidar com marcadores de fala
      case ('speechMarker'): {
        const { name: speechMarkerName } = message.body;
        switch (speechMarkerName) {
          // @showCards() e @hideCards() não acionam mais um marcador de fala
          // não é necessário com API de cartão de conteúdo
          case ('cinematic'): {
            // disparado quando o CUE muda os ângulos da câmera
            break;
          }
          case ('feature'): {
            const { arguments: featureArgs } = message.body;
            const feature = featureArgs[0];
            const featureState = featureArgs[1];
            console.log(feature, featureState);
            switch (feature) {
              case ('camera'): {
                console.log('camera');
                if (featureState === 'on') thunk.dispatch(actions.setCameraOn({ cameraOn: true }));
                else if (featureState === 'off') thunk.dispatch(actions.setCameraOn({ cameraOn: false }));
                else console.error(`state ${featureState} not supported by @feature(camera)!`);
                break;
              }
              case ('microphone'): {
                console.log('mic');
                if (featureState === 'on') thunk.dispatch(actions.setMicOn({ micOn: true }));
                else if (featureState === 'off') thunk.dispatch(actions.setMicOn({ micOn: false }));
                else console.error(`state ${featureState} not supported by @feature(microphone)!`);
                break;
              }
              case ('transcript'): {
                console.log('transcript');
                if (featureState === 'on') thunk.dispatch(actions.setShowTranscript(true));
                else if (featureState === 'off') thunk.dispatch(actions.setShowTranscript(false));
                else console.error(`state ${featureState} not supported by @feature(transcript)!`);
                break;
              }
              case ('audio'): {
                console.log('audio');
                if (featureState === 'on') thunk.dispatch(actions.setOutputMute({ isOutputMuted: true }));
                else if (featureState === 'off') thunk.dispatch(actions.setOutputMute({ isOutputMuted: false }));
                else console.error(`state ${featureState} not supported by @feature(audio)!`);
                break;
              }
              default: {
                console.error(`@feature(${feature}) not recognized!`);
              }
            }
            break;
          }
          case ('close'): {
            thunk.dispatch(disconnect());
            break;
          }
          case ('marker'): {
            // manipulador de marcador de fala personalizado
            const { arguments: markerArgs } = message.body;
            markerArgs.forEach((a) => {
              switch (a) {
                // marcador de fala "ovo de páscoa", imprime "almôndega convocada" em ASCII para consolar
                case ('triggerMeatball'): {
                  console.log(meatballString);
                  break;
                }
                case ('highlightMic'): {
                  thunk.dispatch(actions.setHighlightMic({ highlightMic: true }));
                  setTimeout(() => {
                    thunk.dispatch(actions.setHighlightMic({ highlightMic: false }));
                  }, 3000);
                  break;
                }
                case ('highlightMute'): {
                  thunk.dispatch(actions.setHighlightMute({ highlightMute: true }));
                  setTimeout(() => {
                    thunk.dispatch(actions.setHighlightMute({ highlightMute: false }));
                  }, 3000);
                  break;
                }
                case ('highlightChat'): {
                  thunk.dispatch(actions.setHighlightChat({ highlightChat: true }));
                  setTimeout(() => {
                    thunk.dispatch(actions.setHighlightChat({ highlightChat: false }));
                  }, 3000);
                  break;
                }
                case ('highlightCamera'): {
                  thunk.dispatch(actions.setHighlightCamera({ highlightCamera: true }));
                  setTimeout(() => {
                    thunk.dispatch(actions.setHighlightCamera({ highlightCamera: false }));
                  }, 3000);
                  break;
                }
                case ('highlightSkip'): {
                  thunk.dispatch(actions.setHighlightSkip({ highlightSkip: true }));
                  setTimeout(() => {
                    thunk.dispatch(actions.setHighlightSkip({ highlightSkip: false }));
                  }, 3000);
                  break;
                }
                case ('highlightMenu'): {
                  thunk.dispatch(actions.setHighlightMenu({ highlightMenu: true }));
                  setTimeout(() => {
                    thunk.dispatch(actions.setHighlightMenu({ highlightMenu: false }));
                  }, 3000);
                  break;
                }
                default: {
                  console.warn(`no handler for @marker(${a})!`);
                }
              }
            });
            break;
          }
          default: {
            console.warn(`unrecognized speech marker: ${speechMarkerName}`);
          }
        }
        break;
      }

      case ('updateContentAwareness'): {
        //disparado quando o reconhecimento do conteúdo muda
        // por exemplo, um elemento com data-sm-content entra/sai do DOM
        break;
      }
      case ('conversationSend'): {
        // disparado quando o usuário digita manualmente alguma entrada
        // nós lidamos com isso em outro lugar, então não precisamos lidar com este evento
        break;
      }

      // mensagens de estado contêm muitas coisas, incluindo emoções do usuário,
      // estatísticas de chamadas e estado da personalidade
      case ('state'): {
        const { body } = message;
        if ('persona' in body) {
          const personaState = body.persona[1];

          // lidar com mudanças no estado de fala da persona, ou seja, inativo, animado, falando
          if ('speechState' in personaState) {
            const { speechState } = personaState;
            const action = actions.setSpeechState({ speechState });
            thunk.dispatch(action);
          }

          if ('users' in personaState) {
            // lidar com vários valores numéricos, como emoção do usuário ou
            // probabilidade de o usuário estar falando
            const userState = personaState.users[0];

            if ('emotion' in userState) {
              const { emotion } = userState;
              const roundedEmotion = roundObject(emotion);
              const action = actions.setEmotionState({ emotion: roundedEmotion });
              thunk.dispatch(action);
            }

            if ('activity' in userState) {
              const { activity } = userState;
              const roundedActivity = roundObject(activity, 1000);
              const action = actions.setEmotionState({ activity: roundedActivity });
              thunk.dispatch(action);
            }

            if ('conversation' in userState) {
              const { conversation } = userState;
              const { context } = conversation;
              const roundedContext = roundObject(context);
              const action = actions.setConversationState({
                conversation: {
                  ...conversation,
                  context: roundedContext,
                },
              });
              thunk.dispatch(action);
            }
          }
        } else if ('statistics' in body) {
          const { callQuality } = body.statistics;
          thunk.dispatch(actions.setCallQuality({ callQuality }));
        }
        break;
      }

      // eventos de ativação são algum tipo de metadados emocionais
      case ('activation'): {
        // console.warn('activation handler not yet implemented', message);
        break;
      }

      // Os eventos animateToNamedCamera são acionados sempre que alteramos o ângulo da câmera.
      // deixado sem implementação por enquanto, pois há apenas uma câmera nomeada (closeUp)
      case ('animateToNamedCamera'): {
        // console.warn('animateToNamedCamera handler not yet implemented', message);
        break;
      }

      case ('stopRecognize'): {
        break;
      }

      case ('startRecognize'): {
        break;
      }

      default: {
        console.warn(`unknown message type: ${message.name}`, message);
      }
    }
    return true;
  };

  // criar instância da classe Persona com instância de cena
  persona = new Persona(scene, PERSONA_ID);

  /* CONECTE-SE À PESSOA */
  try {
    // obter JWT assinado do servidor de token para que possamos nos conectar ao servidor Persona
    let jwt = null;
    let url = null;
    if (AUTH_MODE === 1) {
      const [tokenErr, tokenRes] = await to(fetch(TOKEN_ISSUER, { method: 'POST' }));
      if (tokenErr) return thunk.rejectWithValue({ msg: 'error fetching token! is this endpoint CORS authorized?' });
      const res = await tokenRes.json();
      jwt = res.jwt;
      url = res.url;
    }

    // conectar-se ao servidor Persona
    const retryOptions = {
      maxRetries: 20,
      delayMs: 500,
    };
    const [err, sessionID] = await to(scene.connect(url, '', jwt, retryOptions));
    if (err) {
      switch (err.name) {
        case 'notSupported':
        case 'noUserMedia': {
          return thunk.rejectWithValue({ msg: 'permissionsDenied', err: { ...err } });
        }
        default: {
          return thunk.rejectWithValue({ msg: 'generic', err: { ...err } });
        }
      }
    }
    // passar o ID da sessão para o estado para que possamos coordenar as análises com os dados da sessão
    thunk.dispatch(actions.setSessionID({ sessionID }));
    // não podemos desativar o registro até que a conexão seja estabelecida
    // o registro está muito lotado, não é recomendado ativar
    // a menos que você precise depurar dados emocionais da webcam
    scene.session().setLogging(false);

    // definir dimensões do vídeo
    const { videoWidth, videoHeight } = thunk.getState().sm;
    // resolução de cálculo com proporção de pixels do dispositivo
    const deviceWidth = Math.round(videoWidth * window.devicePixelRatio);
    const deviceHeight = Math.round(videoHeight * window.devicePixelRatio);
    scene.sendVideoBounds(deviceWidth, deviceHeight);

    // crie proxy de feed de vídeo da webcam se o usuário nos tiver concedido permissão

    // já que não podemos armazenar o userMediaStream na loja, pois não é serializável,
    // usamos um proxy externo para streams de vídeo
    const { userMediaStream: stream } = scene.session();

    if (cameraDenied === false) thunk.dispatch(actions.setCameraState({ cameraOn: false }));
    // passe o despacho antes de chamar setUserMediaStream para que o proxy possa enviar dimensões para armazenar
    mediaStreamProxy.passDispatch(thunk.dispatch);
    mediaStreamProxy.setUserMediaStream(stream, cameraDenied);
    mediaStreamProxy.enableToggle(scene);

    // cumpra a promessa, o redutor define o estado para indicar que o carregamento e a conexão estão completos
    return thunk.fulfillWithValue();
  } catch (err) {
    return thunk.rejectWithValue(err);
  }
});

// envie texto simples para a persona.
// geralmente usado para entrada digitada ou elementos de interface do usuário que acionam uma determinada frase
export const sendTextMessage = createAsyncThunk('sm/sendTextMessage', async ({ text }, thunk) => {
  if (text === '') return thunk.rejectWithValue('submitted empty string!');
  if (scene !== null && persona !== null) {
    persona.conversationSend(text);
    return thunk.dispatch(actions.addConversationResult({
      source: 'user',
      text,
    }));
  } return thunk.rejectWithValue('not connected to persona!');
});

const smSlice = createSlice({
  name: 'sm',
  initialState,
  reducers: {
    setHighlightMic: (state, { payload }) => ({ ...state, highlightMic: payload.highlightMic }),
    setHighlightMute: (state, { payload }) => ({ ...state, highlightMute: payload.highlightMute }),
    setHighlightChat: (state, { payload }) => ({ ...state, highlightChat: payload.highlightChat }),
    setHighlightMenu: (state, { payload }) => ({ ...state, highlightMenu: payload.highlightMenu }),
    setHighlightSkip: (state, { payload }) => ({ ...state, highlightSkip: payload.highlightSkip }),
    setHighlightCamera: (state, { payload }) => ({
      ...state,
      highlightCamera: payload.highlightCamera,
    }),
    setSessionID: (state, { payload }) => ({
      ...state,
      sessionID: payload.sessionID,
    }),
    setConnectionState: (state, { payload }) => ({
      ...state,
      connectionState: {
        ...payload,
      },
    }),
    setTOS: (state, { payload }) => ({
      ...state,
      tosAccepted: payload.accepted,
    }),
    setShowTranscript: (state, { payload }) => ({
      ...state,
      showTranscript: payload !== undefined ? payload : !state.showTranscript,
    }),
    setRequestedMediaPerms: (state, { payload }) => {
      const requestedMediaPerms = {
        camera: 'camera' in payload ? payload.camera : state.requestedMediaPerms.camera,
        mic: 'mic' in payload ? payload.mic : state.requestedMediaPerms.mic,
        cameraDenied: 'cameraDenied' in payload ? payload.cameraDenied : state.requestedMediaPerms.cameraDenied,
        micDenied: 'micDenied' in payload ? payload.micDenied : state.requestedMediaPerms.micDenied,
      };
      sessionStorage.setItem('requestedMediaPerms', JSON.stringify(requestedMediaPerms));
      return ({
        ...state,
        requestedMediaPerms,
      });
    },
    setCameraState: (state, { payload }) => ({
      ...state,
      cameraOn: payload.cameraOn,
      cameraWidth: payload.cameraWidth || state.cameraWidth,
      cameraHeight: payload.cameraHeight || state.cameraHeight,
    }),
    setActiveCards: (state, { payload }) => ({
      ...state,
      activeCards: payload.activeCards || [],
    }),
    stopSpeaking: () => {
      if (!persona) console.error('persona não iniciada!');
      else persona.stopSpeaking();
    },
    setMicOn: (state, { payload }) => {
      if (!scene) return console.error('cena não iniciada!');
      const { micOn } = payload;
      scene.setMediaDeviceActive({
        microphone: micOn,
      });
      return ({ ...state, micOn });
    },
    setCameraOn: (state, { payload }) => {
      if (!scene) return console.error('cena não iniciada!');
      const { cameraOn } = payload;
      scene.setMediaDeviceActive({
        camera: cameraOn,
      });
      return ({ ...state, cameraOn });
    },
    setMediaDevices: (state, { payload }) => {
      if (!scene) return console.error('cena não iniciada!');
      const {
        cameraOn, micOn,
      } = payload;
      scene.setMediaDeviceActive({
        camera: cameraOn,
        mic: micOn,
      });
      return ({ ...state, cameraOn, micOn });
    },
    setOutputMute: (state, { payload }) => {
      const { isOutputMuted } = payload;
      proxyVideo.muted = isOutputMuted ? 'muted' : null;
      return ({ ...state, isOutputMuted });
    },
    setIntermediateUserUtterance: (state, { payload }) => ({
      ...state,
      intermediateUserUtterance: payload.text,
      userSpeaking: true,
    }),
    clearTranscript: (state) => ({
      ...state,
      transcript: [],
    }),
    addConversationResult: (state, { payload }) => {
      // we record both text and content cards in the transcript
      if (payload.text !== '' || 'card' in payload !== false) {
        const { source } = payload;
        const newEntry = { source, timestamp: new Date(Date.now()).toISOString() };
        // lidar com a inserção de texto ou cartão na matriz de transcrição
        if ('text' in payload) newEntry.text = payload.text;
        if ('card' in payload) newEntry.card = payload.card;
        const out = {
          ...state,
          transcript: [...state.transcript, { ...newEntry }],
          intermediateUserUtterance: '',
          userSpeaking: false,
        };
        // copie qualquer texto para last___Enunciado, usado para legendas e confirmação do usuário do STT
        if ('text' in payload) {
          out[
            payload.source === 'user' ? 'lastUserUtterance' : 'lastPersonaUtterance'
          ] = payload.text;
        }
        return out;
      } return console.warn('addConversationResult: ignorando string vazia');
    },
    setSpeechState: (state, { payload }) => ({
      ...state,
      speechState: payload.speechState,
    }),
    setEmotionState: (state, { payload }) => ({
      ...state,
      user: {
        ...state.user,
        emotion: payload.emotion,
      },
    }),
    setConversationState: (state, { payload }) => ({
      ...state,
      user: {
        ...state.user,
        conversation: payload.conversation,
      },
    }),
    setActivityState: (state, { payload }) => ({
      ...state,
      user: {
        ...state.user,
        activity: payload.activity,
      },
    }),
    setCallQuality: (state, { payload }) => ({
      ...state,
      callQuality: payload.callQuality,
    }),
    setVideoDimensions: (state, { payload }) => {
      const { videoWidth, videoHeight } = payload;
      // atualizar as dimensões do vídeo pessoalmente
      // resolução de cálculo com proporção de pixels do dispositivo
      const deviceWidth = Math.round(videoWidth * window.devicePixelRatio);
      const deviceHeight = Math.round(videoHeight * window.devicePixelRatio);
      scene.sendVideoBounds(deviceWidth, deviceHeight);
      return { ...state, videoWidth, videoHeight };
    },
    disconnect: (state) => {
      scene = null;
      persona = null;
      const { error } = state;
      // extraia o último carimbo de data/hora da transcrição
      const { transcript, startedAt } = state;
      // ao desconectar, a persona adicionará entradas adicionais à transcrição.
      // pegue a hora da última mensagem do usuário.
      const lastUserMessage = transcript.filter((item) => item.source === 'user');
      const lastTranscriptItem = lastUserMessage[lastUserMessage.length - 1];
      const timestamp = lastTranscriptItem?.timestamp || new Date(startedAt);
      const timeDiff = new Date(Date.now()) - Date.parse(timestamp);
      // se tiver mais de 4 minutos (o limite mínimo de tempo limite é 5), presuma que o tempo limite do usuário expirou
      const presumeTimeout = timeDiff > 300;
      return {
        // redefinir completamente o estado do SM ao desconectar, exceto por erros
        ...initialState,
        disconnected: true,
        error,
        presumeTimeout,
        startedAt,
      };
    },
    keepAlive: () => {
      if (scene) scene.keepAlive();
      else console.error('não é possível chamar keepAlive, a cena não foi iniciada!');
    },
    sendEvent: (state, { payload }) => {
      const { eventName, payload: eventPayload, kind } = payload;
      if (scene && persona) {
        persona.conversationSend(eventName, eventPayload || {}, { kind: kind || 'event' });
      }
    },
    clearActiveCards: () => {
      // we don't need to modify the state, since this will propagate through
      // the scene instance and modify the active cards through the CC API
      scene.clearActiveCards();
    },
  },
  extraReducers: {
    [createScene.pending]: (state) => ({
      ...state,
      loading: true,
      disconnected: false,
      error: null,
    }),
    [createScene.fulfilled]: (state) => ({
      ...state,
      loading: false,
      connected: true,
      startedAt: Date.now(),
      error: null,
    }),
    [createScene.rejected]: (state, { error }) => {
      try {
        scene.disconnect();
      } catch {
        console.error('nenhuma cena para desconectar! continuando...');
      }
      // se chamarmos isso imediatamente, a chamada de desconexão poderá não ser concluída
      setTimeout(() => {
        scene = null;
        persona = null;
      }, 100);
      return ({
        ...state,
        loading: false,
        connected: false,
        error: { msg: error.message },
      });
    },
  },
});

// hoist actions to top of file so thunks can access
actions = smSlice.actions;

export const {
  setVideoDimensions,
  stopSpeaking,
  setActiveCards,
  setCameraState,
  setCameraOn,
  setMicOn,
  setShowTranscript,
  setTOS,
  setRequestedMediaPerms,
  setOutputMute,
  keepAlive,
  sendEvent,
  clearActiveCards,
  addConversationResult,
  clearTranscript,
  setHighlightMic,
  setHighlightMute,
  setHighlightChat,
  setHighlightMenu,
  setHighlightCamera,
  setHighlightSkip,
} = smSlice.actions;

export default smSlice.reducer;

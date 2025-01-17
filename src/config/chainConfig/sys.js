import {formatSwapTokenList, getLocalRPC} from './methods'
import {tokenListUrl, VERSION, USE_VERSION} from '../constant'

export const SYS_MAIN_CHAINID = 57
export const SYS_MAINNET = getLocalRPC(SYS_MAIN_CHAINID, 'https://rpc.syscoin.org')
export const SYS_MAIN_EXPLORER = 'https://explorer.syscoin.org'

export const tokenList = []
export const testTokenList = []

const symbol = 'SYS'

const bridgeToken = {
  [VERSION.V1]: {
    bridgeInitToken: '',
    bridgeInitChain: '',
  },
  [VERSION.V5]: {
    bridgeInitToken: '',
    bridgeInitChain: '',
    nativeToken: '',
    crossBridgeInitToken: ''
  },
  [VERSION.V7]: {
    bridgeInitToken: '',
    bridgeInitChain: '',
    nativeToken: '',
    crossBridgeInitToken: ''
  },
}

export default {
  [SYS_MAIN_CHAINID]: {
    tokenListUrl: tokenListUrl + SYS_MAIN_CHAINID,
    tokenList: formatSwapTokenList(symbol, tokenList),
    ...bridgeToken[USE_VERSION],
    swapRouterToken: '',
    swapInitToken: '',
    multicalToken: '0x077a210d0baa86c23ae8f80021b177ebc5bee25e',
    v1FactoryToken: '',
    v2FactoryToken: '',
    timelock: '',
    nodeRpc: SYS_MAINNET,
    nodeRpcList: [
      SYS_MAINNET,
    ],
    chainID: SYS_MAIN_CHAINID,
    lookHash: SYS_MAIN_EXPLORER + '/tx/',
    lookAddr: SYS_MAIN_EXPLORER + '/address/',
    lookBlock: SYS_MAIN_EXPLORER + '/block/',
    explorer: SYS_MAIN_EXPLORER,
    symbol: symbol,
    name: 'Syscoin NEVM',
    networkName: 'SYS mainnet',
    networkLogo: 'SYS',
    type: 'main',
    label: SYS_MAIN_CHAINID,
    isSwitch: 1,
    suffix: 'SYS',
    anyToken: ''
  },
}
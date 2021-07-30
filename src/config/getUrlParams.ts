import { chainInfo } from './chainConfig'
import { isAddress } from '../utils'

// import {ARBITRUM_MAIN_CHAINID} from './chainConfig/arbitrum'
// import {AVAX_MAIN_CHAINID} from './chainConfig/avax'
import {BNB_MAIN_CHAINID} from './chainConfig/bsc'
import {ETH_MAIN_CHAINID} from './chainConfig/eth'
import {FSN_MAIN_CHAINID} from './chainConfig/fsn'
import {FTM_MAIN_CHAINID} from './chainConfig/ftm'
import {HT_MAIN_CHAINID} from './chainConfig/ht'

// import {selectNetwork} from '../components/Header/SelectNetwork'
// import {MATIC_MAIN_CHAINID} from './chainConfig/matic'
// import {XDAI_MAIN_CHAINID} from './chainConfig/xdai'
// import {KCC_MAIN_CHAINID} from './chainConfig/kcc'
// import {OKT_MAIN_CHAINID} from './chainConfig/okt'

export function getParams(param: any) {
  const str = window.location.href.indexOf('?') ? window.location.href.split('?')[1] : ''
  if (str) {
    const arr = str.split('&')
    let value = ''
    for (const str2 of arr) {
      const arr2 = str2.split('=')
      if (arr2[0] === param) {
        value = arr2[1]
        break
      }
    }
    return value
  } else {
    return ''
  }
}

export function getInitBridgeChain(destChainID: any, bridgeToken: any) {
  const nc = {
    initChain: destChainID,
    bridgeInitToken: bridgeToken
  }
  const dc = getParams('destchainid')
  const bt = getParams('bridgetoken')
  if (dc) {
    nc.initChain = dc
  }
  if (bt && isAddress(bt)) {
    nc.bridgeInitToken = bt
  }

  return nc
}

function selectNetwork (chainID:any) {
  return new Promise(resolve => {
    const { ethereum } = window
    const ethereumFN:any = {
      request: '',
      ...ethereum
    }
    if (ethereumFN && ethereumFN.request) {
      const data = {
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x' + Number(chainID).toString(16), // A 0x-prefixed hexadecimal string
            chainName: chainInfo[chainID].networkName,
            nativeCurrency: {
              name: chainInfo[chainID].name,
              symbol: chainInfo[chainID].symbol, // 2-6 characters long
              decimals: 18,
            },
            rpcUrls: [chainInfo[chainID].nodeRpc],
            blockExplorerUrls: chainInfo[chainID].nodeRpcList ? chainInfo[chainID].nodeRpcList : [chainInfo[chainID].explorer],
            iconUrls: null // Currently ignored.
          }
        ],
      }
      // console.log(data)
      ethereumFN.request(data).then((res: any) => {
        console.log(res)
        localStorage.setItem('ENV_NODE_CONFIG', chainInfo[chainID].label)
        // history.go(0)
        resolve({
          msg: 'Success'
        })
      }).catch((err: any) => {
        console.log(err)
        resolve({
          msg: 'Error'
        })
      })
    } else {
      resolve({
        msg: 'Error'
      })
    }
  })
}

function getParamNode(type: any, INIT_NODE: any) {
  type = type?.toString()?.toLowerCase()
  let labelStr = INIT_NODE
  for (const key in chainInfo) {
    // console.log(key)
    if (
      type === key
      || type === chainInfo[key].symbol.toLowerCase()
      || type === chainInfo[key].name.toLowerCase()
    ) {
      labelStr = chainInfo[key].label
      break
    }
  }
  selectNetwork(labelStr)
  return labelStr
}

function getNode(type: any, INIT_NODE: any) {
  if (type.indexOf('fsn') !== -1) {
    return chainInfo[FSN_MAIN_CHAINID].label
  } else if (type.indexOf('bsc') !== -1) {
    return chainInfo[BNB_MAIN_CHAINID].label
  } else if (type.indexOf('ftm') !== -1) {
    return chainInfo[FTM_MAIN_CHAINID].label
  } else if (type.indexOf('eth') !== -1) {
    return chainInfo[ETH_MAIN_CHAINID].label
  } else if (type.indexOf('huobi') !== -1) {
    return chainInfo[HT_MAIN_CHAINID].label
  } else {
    return INIT_NODE
  }
}
export function getNetwork(ENV_NODE_CONFIG: any, INIT_NODE: any) {
  let nc = ''
  const urlParams = getParams('network')
  const srcchainid = getParams('srcchainid')
  const localHost = window.location.host
  const localStr = localStorage.getItem(ENV_NODE_CONFIG)
  if (urlParams) {
    nc = getParamNode(urlParams, INIT_NODE)
    localStorage.setItem(ENV_NODE_CONFIG, nc)
  } else if (srcchainid) {
    nc = getParamNode(srcchainid, INIT_NODE)
    localStorage.setItem(ENV_NODE_CONFIG, nc)
  } else {
    if (localStr) {
      nc = localStr
    } else {
      nc = getNode(localHost, INIT_NODE)
      localStorage.setItem(ENV_NODE_CONFIG, nc)
    }
  }
  return nc
}

const ID_CODE = 'ID_CODE'
export function getIdCode() {
  const urlParams = getParams('agent')
  if (urlParams) {
    localStorage.setItem(ID_CODE, urlParams)
  }
}

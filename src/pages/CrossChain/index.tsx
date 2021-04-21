import React, { useEffect, useState, useContext, useMemo, useCallback } from 'react'
import { TokenAmount } from 'anyswap-sdk'
// import { createBrowserHistory } from 'history'
import { useTranslation } from 'react-i18next'
import { ThemeContext } from 'styled-components'
import { ArrowDown } from 'react-feather'

import SelectChainIdInputPanel from './selectChainID'
import Reminder from './reminder'

import { useActiveWeb3React } from '../../hooks'
import {useBridgeCallback, useBridgeUnderlyingCallback} from '../../hooks/useBridgeCallback'
import { WrapType } from '../../hooks/useWrapCallback'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
import { useLocalToken } from '../../hooks/Tokens'

import SelectCurrencyInputPanel from '../../components/CurrencySelect/selectCurrency'
import { AutoColumn } from '../../components/Column'
import { ButtonLight, ButtonPrimary, ButtonConfirmed } from '../../components/Button'
import { AutoRow } from '../../components/Row'
import Loader from '../../components/Loader'
import AddressInputPanel from '../../components/AddressInputPanel'
import { ArrowWrapper, BottomGrouping } from '../../components/swap/styleds'
import Title from '../../components/Title'

import { useWalletModalToggle, useToggleNetworkModal } from '../../state/application/hooks'

import config from '../../config'
import {getParams} from '../../config/getUrlParams'

import {getTokenConfig} from '../../utils/bridge/getBaseInfo'
import {formatDecimal} from '../../utils/tools/tools'
import { isAddress } from '../../utils'

import AppBody from '../AppBody'

// let initBridgeToken:any = getParams('bridgetoken') ? getParams('bridgetoken') : ''
// initBridgeToken = initBridgeToken && isAddress(initBridgeToken) ? initBridgeToken.toLowerCase() : ''

export default function CrossChain() {
  const { account, chainId } = useActiveWeb3React()
  const { t } = useTranslation()
  const toggleNetworkModal = useToggleNetworkModal()
  // const history = createBrowserHistory()
  const theme = useContext(ThemeContext)
  const toggleWalletModal = useWalletModalToggle()

  const [inputBridgeValue, setInputBridgeValue] = useState('')
  const [selectCurrency, setSelectCurrency] = useState<any>()
  const [selectChain, setSelectChain] = useState<any>()
  const [recipient, setRecipient] = useState<any>(account ?? '')
  const [swapType, setSwapType] = useState('swap')
  const [count, setCount] = useState<number>(0)

  const [modalOpen, setModalOpen] = useState(false)

  const [bridgeConfig, setBridgeConfig] = useState<any>()

  const [approvalSubmitted, setApprovalSubmitted] = useState<boolean>(false)

  let initBridgeToken:any = getParams('bridgetoken') ? getParams('bridgetoken') : ''
  initBridgeToken = initBridgeToken && isAddress(initBridgeToken) ? initBridgeToken.toLowerCase() : ''
  // console.log(initBridgeToken)

  

  const formatCurrency = useLocalToken(
    selectCurrency && selectCurrency.underlying ?
      {...selectCurrency, address: selectCurrency.underlying.address, name: selectCurrency.underlying.name, symbol: selectCurrency.underlying.symbol} : selectCurrency)
  const amountToApprove = formatCurrency ? new TokenAmount(formatCurrency ?? undefined, inputBridgeValue) : undefined
  const [approval, approveCallback] = useApproveCallback(amountToApprove ?? undefined, config.getCurChainInfo(chainId).bridgeRouterToken)

  useEffect(() => {
    if (approval === ApprovalState.PENDING) {
      setApprovalSubmitted(true)
    }
  }, [approval, approvalSubmitted])
  
  const { wrapType, execute: onWrap, inputError: wrapInputError } = useBridgeCallback(
    formatCurrency?formatCurrency:undefined,
    selectCurrency?.address,
    recipient,
    inputBridgeValue,
    selectChain
  )

  const { wrapType: wrapTypeUnderlying, execute: onWrapUnderlying, inputError: wrapInputErrorUnderlying } = useBridgeUnderlyingCallback(
    formatCurrency?formatCurrency:undefined,
    selectCurrency?.address,
    recipient,
    inputBridgeValue,
    selectChain
  )
    // console.log(selectCurrency)
  const outputBridgeValue = useMemo(() => {
    if (inputBridgeValue && bridgeConfig) {
      const fee = Number(inputBridgeValue) * Number(bridgeConfig.SwapFeeRatePerMillion)
      let value = Number(inputBridgeValue) - fee
      if (fee < Number(bridgeConfig.MinimumSwapFee)) {
        value = Number(inputBridgeValue) - Number(bridgeConfig.MinimumSwapFee)
      } else if (fee > bridgeConfig.MaximumSwapFee) {
        value = Number(inputBridgeValue) - Number(bridgeConfig.MaximumSwapFee)
      }
      if (value && Number(value) && Number(value) > 0) {
        return formatDecimal(value, Math.min(6, selectCurrency.decimals))
      }
      return ''
    } else {
      return ''
    }
  }, [inputBridgeValue, bridgeConfig])

  const isCrossBridge = useMemo(() => {
    if (
      account
      && bridgeConfig
      && selectCurrency
      && inputBridgeValue
      && (
        (!wrapInputError && !(selectCurrency && selectCurrency.underlying))
        || (!wrapInputErrorUnderlying && (selectCurrency && selectCurrency.underlying))
      )
      && isAddress(recipient)
    ) {
      if (Number(inputBridgeValue) < Number(bridgeConfig.MinimumSwap) || Number(inputBridgeValue) > Number(bridgeConfig.MaximumSwap)) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }, [selectCurrency, account, bridgeConfig, wrapInputError, inputBridgeValue, recipient, wrapInputErrorUnderlying])

  const btnTxt = useMemo(() => {
    if (wrapInputError && inputBridgeValue) {
      return wrapInputError
    } else if (wrapInputError && !inputBridgeValue) {
      return t('swap')
    } else if (
      (wrapType === WrapType.WRAP && !(selectCurrency && selectCurrency.underlying))
      || (wrapTypeUnderlying === WrapType.WRAP && (selectCurrency && selectCurrency.underlying))
    ) {
      return t('swap')
    }
    return t('swap')
  }, [t, wrapInputError, wrapTypeUnderlying, selectCurrency])

  useEffect(() => {
    if (chainId && !selectChain) {
      setSelectChain(config.getCurChainInfo(chainId).bridgeInitChain)
    }
  }, [chainId, selectChain])
  useEffect(() => {
    if (chainId) {
      setSelectChain(config.getCurChainInfo(chainId).bridgeInitChain)
    }
  }, [chainId])

  useEffect(() => {
    const token = selectCurrency && selectCurrency.chainId === chainId ? selectCurrency.address : (initBridgeToken ? initBridgeToken : config.getCurChainInfo(chainId).bridgeInitToken)

    if (token && isAddress(token)) {
      getTokenConfig(token, chainId).then((res:any) => {
        console.log(res)
        if (res && res.decimals && res.symbol) {
          setBridgeConfig(res)
          if (!selectCurrency || selectCurrency.chainId !== chainId) {
            setSelectCurrency({
              "address": token,
              "chainId": chainId,
              "decimals": res.decimals,
              "name": res.name,
              "symbol": res.symbol,
              "underlying": res.underlying
            })
          }
        } else {
          setTimeout(() => {
            setCount(count + 1)
            // setCount(1)
          }, 1000)
          setBridgeConfig('')
        }
      })
    } else {
      setBridgeConfig('')
    }
    // getBaseInfo()
  }, [selectCurrency, count, initBridgeToken, chainId])

  const handleMaxInput = useCallback((value) => {
    if (value) {
      setInputBridgeValue(value)
    } else {
      setInputBridgeValue('')
    }
  }, [setInputBridgeValue])

  return (
    <>
      <AppBody>
        <Title
          title={t('swap')} 
          
          tabList={[
            {
              name: t('swap'),
              onTabClick: () => {
                setSwapType('swap')
                if (account) {
                  setRecipient(account)
                }
              },
              iconUrl: require('../../assets/images/icon/deposit.svg'),
              iconActiveUrl: require('../../assets/images/icon/deposit-purple.svg')
            },
            {
              name: t('send'),
              onTabClick: () => {
                setSwapType('send')
                setRecipient('')
              },
              iconUrl: require('../../assets/images/icon/withdraw.svg'),
              iconActiveUrl: require('../../assets/images/icon/withdraw-purple.svg')
            }
          ]}
        ></Title>
        <AutoColumn gap={'md'}>

          <SelectCurrencyInputPanel
            label={t('From')}
            value={inputBridgeValue}
            onUserInput={(value) => {
              setInputBridgeValue(value)
            }}
            onCurrencySelect={(inputCurrency) => {
              console.log(inputCurrency)
              setSelectCurrency(inputCurrency)
            }}
            onMax={(value) => {
              handleMaxInput(value)
            }}
            currency={formatCurrency}
            disableCurrencySelect={false}
            showMaxButton={true}
            isViewNetwork={true}
            onOpenModalView={(value) => {
              console.log(value)
              setModalOpen(value)
            }}
            isViewModal={modalOpen}
            id="selectCurrency"
          />

          <AutoRow justify="center" style={{ padding: '0 1rem' }}>
            <ArrowWrapper clickable={false} style={{cursor:'pointer'}} onClick={() => {
              toggleNetworkModal()
            }}>
              <ArrowDown size="16" color={theme.text2} />
            </ArrowWrapper>
          </AutoRow>

          <SelectChainIdInputPanel
            label={t('to')}
            value={outputBridgeValue.toString()}
            onUserInput={(value) => {
              setInputBridgeValue(value)
            }}
            onChainSelect={(chainID) => {
              setSelectChain(chainID)
            }}
            selectChainId={selectChain}
            id="selectChainID"
            onOpenModalView={(value) => {
              console.log(value)
              setModalOpen(value)
            }}
            bridgeConfig={bridgeConfig}
          />
          {swapType == 'swap' ? '' : (
            <AddressInputPanel id="recipient" value={recipient} onChange={setRecipient} />
          )}
        </AutoColumn>

        <Reminder bridgeConfig={bridgeConfig} bridgeType='bridgeAssets' currency={selectCurrency} />

        <BottomGrouping>
          {!account ? (
              <ButtonLight onClick={toggleWalletModal}>{t('ConnectWallet')}</ButtonLight>
            ) : (
              selectCurrency && selectCurrency.underlying && inputBridgeValue && (approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING)? (
                <ButtonConfirmed
                  onClick={approveCallback}
                  disabled={approval !== ApprovalState.NOT_APPROVED || approvalSubmitted}
                  width="48%"
                  altDisabledStyle={approval === ApprovalState.PENDING} // show solid button while waiting
                  // confirmed={approval === ApprovalState.APPROVED}
                >
                  {approval === ApprovalState.PENDING ? (
                    <AutoRow gap="6px" justify="center">
                      {t('Approving')} <Loader stroke="white" />
                    </AutoRow>
                  ) : approvalSubmitted ? (
                    t('Approved')
                  ) : (
                    t('Approve') + ' ' + config.getBaseCoin(selectCurrency?.symbol)
                  )}
                </ButtonConfirmed>
              ) : (
                <ButtonPrimary disabled={isCrossBridge} onClick={!selectCurrency || !selectCurrency.underlying ? onWrap : onWrapUnderlying}>
                  {btnTxt}
                </ButtonPrimary>
              )
            )
          }
        </BottomGrouping>
      </AppBody>
    </>
  )
}
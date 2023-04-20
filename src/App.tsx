// @import npm modules
import React, { useEffect, useState } from "react";
import { RiArrowUpDownLine } from "react-icons/ri";
import { IoMdSettings, IoMdRefresh } from "react-icons/io";

// @import custom components
import { Button, FastBuyItem, TokenStatus, TradeInput } from "./components";

// @import actions
import { getTokenData, getTokenQuote } from "./actions";

// @import types
import { TokenDataProps } from "./types/actions";

// @import styled components
import {
  ExchangeButtonWrapper,
  FastBuyGrid,
  PageContainer,
  TradeInputGroup,
  TradeToolBarWrapper,
  TradingCardContainer,
  TradingCardWrapper,
} from "./App.styles";

// @import page data
import { fastBuyItems } from "./data";

const App: React.FC = () => {
  const [tokenData, setTokenData] = useState<Array<TokenDataProps>>([]);
  const [quoteData, setQuoteData] = useState<number>(0);
  const [pageLoading, setPageLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedBuyToken, setSelectedBuyToken] = useState<TokenDataProps>();
  const [selectedSellToken, setSelectedSellToken] = useState<TokenDataProps>();
  const [amount, setAmount] = useState(1);
  const [tokenStatus, setTokenStatus] = useState<number>(0);

  useEffect(() => {
    const getData = async () => {
      setPageLoading(true);
      const data = await getTokenData();

      setPageLoading(false);
      setTokenData(data);
    };
    getData();
  }, []);

  useEffect(() => {
    setSelectedBuyToken(tokenData.filter((f) => f.symbol === "ETH")[0]);
    setSelectedSellToken(tokenData.filter((f) => f.symbol === "UMA")[0]);
  }, [tokenData]);

  useEffect(() => {
    getTokenValue(amount);
  }, [selectedBuyToken, selectedSellToken, amount]);

  const getTokenValue = async (value: number) => {
    setLoading(true);
    const tokenQuote = await getTokenQuote({
      fromAddress: selectedBuyToken?.address,
      toAddress: selectedSellToken?.address,
      amount: value * Math.pow(10, Number(selectedBuyToken?.decimals)),
    });
    const status = await getTokenQuote({
      fromAddress: selectedBuyToken?.address,
      toAddress: selectedSellToken?.address,
      amount: 1 * Math.pow(10, Number(selectedBuyToken?.decimals)),
    });
    setLoading(false);
    setTokenStatus(
      Number(
        (
          Number(status?.toTokenAmount) / Math.pow(10, status?.toToken.decimals)
        ).toFixed(5)
      )
    );

    setQuoteData(
      Number(
        (
          Number(tokenQuote?.toTokenAmount) /
          Math.pow(10, tokenQuote?.toToken.decimals)
        ).toFixed(5)
      )
    );
  };

  const handleSelectToken = (token: TokenDataProps, type: string) => {
    if (type === "buy") {
      if (token.address === selectedSellToken?.address) {
        setSelectedSellToken(selectedBuyToken);
      }
      setSelectedBuyToken(token);
    } else {
      if (token.address === selectedBuyToken?.address) {
        setSelectedBuyToken(selectedSellToken);
      }
      setSelectedSellToken(token);
    }
  };

  const handleSellChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (!isNaN(Number(e.target.value))) {
      setAmount(Number(e.target.value));
    }
  };

  const handleExchange = () => {
    setSelectedBuyToken(selectedSellToken);
    setSelectedSellToken(selectedBuyToken);
  };

  const handleSwapClick = () => {};

  const handleFastBuyClick = (per: number) => {};

  return (
    <PageContainer>
      {pageLoading ? (
        <img src="/images/loading.gif" alt="" />
      ) : (
        <TradingCardWrapper>
          <TradingCardContainer>
            <TradeToolBarWrapper>
              <IoMdRefresh size={22} />
              <IoMdSettings size={20} />
            </TradeToolBarWrapper>
            <TradeInputGroup>
              <TradeInput
                selected={
                  selectedBuyToken
                    ? selectedBuyToken
                    : tokenData.filter((f) => f.symbol === "ETH")[0]
                }
                onMinClick={() => setAmount(1)}
                type={"sell"}
                isMin={true}
                amount={amount}
                tokenData={tokenData}
                onSelectChange={(token) => handleSelectToken(token, "buy")}
                onChange={handleSellChange}
              />
              <ExchangeButtonWrapper>
                <span onClick={handleExchange}>
                  <RiArrowUpDownLine size={24} />
                </span>
              </ExchangeButtonWrapper>
              <TradeInput
                selected={
                  selectedSellToken
                    ? selectedSellToken
                    : tokenData.filter((f) => f.symbol === "UMA")[0]
                }
                type={"buy"}
                tokenData={tokenData}
                onSelectChange={(token) => handleSelectToken(token, "sell")}
                quote={quoteData}
                loading={loading}
                onChange={() => {}}
              />
            </TradeInputGroup>
            <FastBuyGrid>
              {fastBuyItems.map((item, key) => (
                <FastBuyItem
                  label={item}
                  key={key}
                  onClick={() => handleFastBuyClick(item)}
                />
              ))}
            </FastBuyGrid>
            <TokenStatus
              loading={loading}
              sellToken={selectedSellToken}
              buyToken={selectedBuyToken}
              value={tokenStatus}
            />
            <Button title="Swap" onClick={handleSwapClick} />
          </TradingCardContainer>
        </TradingCardWrapper>
      )}
    </PageContainer>
  );
};

export default App;

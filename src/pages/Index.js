import { ethers } from "ethers";
import MyContract from "../artifacts/contracts/MyContract.sol/MyContract.json";
import React, { useEffect, useState } from "react";
import { Button, Input, Box, Text, Container } from "@chakra-ui/react";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const provider = new ethers.providers.Web3Provider(window.ethereum);
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  MyContract.abi,
  provider
);
const iface = new ethers.utils.Interface(MyContract.abi);

export const Index = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  const [targetAddress, setTargetAddress] = useState("");

  useEffect(() => {
    const listenForMessages = () => {
      const incomingMessagesFilter = contract.filters.MessageSent(
        null,
        currentAccount
      );
      const outcomingMessagesFilter = contract.filters.MessageSent(
        currentAccount,
        null
      );

      provider.on(incomingMessagesFilter, (...params) => {
        console.log("incoming", params);
        const [{ data, topics }] = params;
        const {
          args: [fromAddress, toAddress, , message],
        } = iface.parseLog({ data, topics });
        setMessages((messages) => [
          ...messages,
          { _sender: fromAddress, _receiver: toAddress, _content: message },
        ]);
      });

      provider.on(outcomingMessagesFilter, (...params) => {
        console.log("incoming", params);
        const [{ data, topics }] = params;
        const {
          args: [fromAddress, toAddress, , message],
        } = iface.parseLog({ data, topics });
        setMessages((messages) => [
          ...messages,
          { _sender: fromAddress, _receiver: toAddress, _content: message },
        ]);
      });
    };

    const requestEthereumAccount = async () => {
      const [account] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(account);
    };
    requestEthereumAccount();

    if (currentAccount) {
      listenForMessages();
    }
  }, [currentAccount]);

  const sendMessage = async () => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      MyContract.abi,
      signer
    );

    const transaction = await contract.sendMessage(
      messageContent,
      targetAddress
    );
    await transaction.wait();
  };

  if (!currentAccount) {
    return (
      <Container
        position="absolute"
        display="flex"
        justifyContent="center"
        alignItems="center"
        w="100%"
        h="100%"
      >
        <Box
          borderRadius="4px"
          p={12}
          boxShadow="0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20)"
        >
          <Text>Loading account...</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Box flexDir="column" height="90vh" width="100vw">
      <Box padding="1rem" w="100%" h="3rem">
        <Box>
          <Text>{currentAccount || ""}</Text>
        </Box>
      </Box>
      <Box w="100%" h="100%" padding="1rem" overflowY="scroll">
        {messages.map((message, index) => (
          <Box
            borderRadius="1rem"
            boxShadow="0 2px 2px 0 rgba(0,0,0,0.14), 0 3px 1px -2px rgba(0,0,0,0.12), 0 1px 5px 0 rgba(0,0,0,0.20)"
            p="1rem"
            key={index}
            marginBottom="2rem"
          >
            <Box>
              <Text>{message._sender}</Text>
            </Box>
            <Box>
              <Text>{message._content}</Text>
            </Box>
          </Box>
        ))}
      </Box>
      <Box w="100%" h="auto" display="flex" flexDir="row">
        <Input
          flex="1"
          placeholder="Target"
          mx="1rem"
          onChange={(evt) => setTargetAddress(evt.target.value)}
        />
        <Input
          mr="1rem"
          flex="2"
          placeholder="Message"
          onChange={(evt) => setMessageContent(evt.target.value)}
        />
        <Button mr="1rem" flex="1" onClick={sendMessage}>
          SEND
        </Button>
      </Box>
    </Box>
  );
};

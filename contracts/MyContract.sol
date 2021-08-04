pragma solidity 0.8.4;

contract MyContract {
    
    struct User {
        address _address;
        string _username;
    }
    
    struct Message {
        address _sender;
        address _receiver;
        string _content;
    }
    
    event MessageSent (
        address indexed _sender,
        address indexed _receiver,
        string indexed content,
        string _content
    );

    constructor(string memory _test) {}
    
    mapping(address => User) private users;
    Message[] private messages;
    
    function setUserData(string memory _username) public {
        users[msg.sender]._username = _username;
    }
    
    function getUsername() public view returns(string memory) {
        return users[msg.sender]._username;
    }
    
    function sendMessage(string memory _content, address _receiver) public {
        address _sender = msg.sender;
        messages.push(Message(_sender, _receiver, _content));
        emit MessageSent(_sender, _receiver, _content, _content);
    }
    
    
    
}
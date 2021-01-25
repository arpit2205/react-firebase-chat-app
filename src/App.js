import React, { useState, useRef, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import {
  Button,
  Container,
  Row,
  Col,
  Card,
  CardTitle,
  CardBody,
  Form,
  InputGroup,
  InputGroupAddon,
  Input,
} from 'reactstrap';
import './App.css';

// firebase
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

import { useAuthState } from 'react-firebase-hooks/auth';
import { findRenderedDOMComponentWithClass } from 'react-dom/test-utils';
import { useCollectionData } from 'react-firebase-hooks/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA9Wyhu66rY7ZilGvkgb6lT4lWgdmRDhwE',
  authDomain: 'react-firebase-bce34.firebaseapp.com',
  projectId: 'react-firebase-bce34',
  storageBucket: 'react-firebase-bce34.appspot.com',
  messagingSenderId: '607060995652',
  appId: '1:607060995652:web:e9448cd799b4450ff11611',
  measurementId: 'G-9MM5KYW8F4',
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  // User
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="App-header">{user ? <ChatRoom /> : <SignIn />}</header>
    </div>
  );
}

const SignIn = () => {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <Container>
      <Row>
        <Button
          onClick={signInWithGoogle}
          color="primary"
          className="ml-auto my-2 mr-2"
        >
          Sign in with Google
        </Button>
      </Row>
    </Container>
  );
};

const SignOut = () => {
  return (
    auth.currentUser && (
      <Button
        onClick={() => auth.signOut()}
        className="ml-auto my-2 mr-2"
        color="danger"
      >
        Sign out
      </Button>
    )
  );
};

const ChatRoom = () => {
  const dummy = useRef();

  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt');

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid } = auth.currentUser;

    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      name: auth.currentUser.displayName,
    });

    setFormValue('');

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Container fluid={true}>
      <Row>
        <SignOut />
      </Row>

      <div id="chat-container">
        {messages?.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={dummy}></div>
      </div>

      <div>
        <Row>
          <Form onSubmit={sendMessage} autoComplete="off">
            <InputGroup>
              <Input
                autoComplete="off"
                placeholder="Write a message here"
                id="input"
                style={{ width: '70vw' }}
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
              />
              <InputGroupAddon addonType="append">
                <Button
                  id="send-btn"
                  disabled={formValue === '' ? true : false}
                  style={{
                    width: '30vw',
                    fontWeight: 'bolder',
                    fontSize: '24px',
                  }}
                  color="success"
                >
                  SEND
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </Form>
        </Row>
      </div>
    </Container>
  );
};

const ChatMessage = (props) => {
  const { text, uid, name } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <Row>
      <div
        style={{ display: 'flex', flexDirection: 'column' }}
        className={`text-box ${messageClass} ${
          messageClass === 'sent' ? 'ml-auto' : 'mr-auto'
        }`}
      >
        <p
          className="px-2 pt-2 pb-0 wrap"
          style={{ textTransform: 'uppercase', fontWeight: 'bold' }}
        >
          {name}
        </p>
        <p className="px-2 wrap">{text}</p>
      </div>
    </Row>
  );
};

export default App;

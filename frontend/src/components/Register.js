
import React, { useState } from "react";
import {Link, useNavigate} from 'react-router-dom'
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRePassword] = useState("");
  const [sentCode, setSentCode] = useState(false);
  const [code, setCode] = useState();
  const navigate =useNavigate();
  function validateForm() {
    return email.length > 0 && password.length > 0 && repassword.length > 0;
  }

  function handleSubmit(event) {

    event.preventDefault();
    
    const data = {email, password, repassword};

    fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          throw new Error(data.error || "Network response was not ok");
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.error) {
        alert(data.error);
      } else {
        //successfull registration
        setSentCode(data.sent);
        // alert(data.message);
        // navigate("/")
      }
    })
    .catch((error) => {
      alert(error);
      console.error("There was a problem with the fetch operation:", error);
    });

  }

  function handleCodeSubmit(e){
    e.preventDefault();
    const data ={email, password}
    if(parseInt(code) === parseInt(sentCode)){
      fetch("http://localhost:5000/api/verifiedRegister", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || "Network response was not ok");
          });
        }
        return response.json();
      })
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          //successfull verification
          navigate("/")
        }
      })
      .catch((error) => {
        alert(error);
        console.error("There was a problem with the fetch operation:", error);
      });
  
    }
    else {
      alert("code didn't match !!")
    }
  }

  return (
    <div className="Register" >
      {!sentCode && <Form onSubmit={handleSubmit}>
        <Form.Group size="lg" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

        </Form.Group>
        <Form.Group size="lg" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

        </Form.Group>

        <Form.Group size="lg" controlId="repassword">
          <Form.Label>Re-type Password</Form.Label>
          <Form.Control
            type="password"
            value={repassword}
            onChange={(e) => setRePassword(e.target.value)}
          />

        </Form.Group>
        <Button block size="lg" type="submit" disabled={!validateForm()}>
          Register
        </Button>
      </Form>}

      {sentCode && (
          <Form onSubmit={handleCodeSubmit}>
            <Form.Group size="lg" controlId="code">
              <Form.Label>Enter Code sent in your mail</Form.Label>
              <Form.Control
                autoFocus
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Form.Group>
            <Button block size="lg" type="submit" disabled={!code}>
              Confirm Code
            </Button>
          </Form>
        )}

      <p className="link">
            Already has an account? <Link to='/'>Login</Link> Here.
      </p>
    </div>
  );
}
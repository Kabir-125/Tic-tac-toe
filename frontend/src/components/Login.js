
import React, { useState } from "react";
import {Link, useNavigate} from 'react-router-dom'
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import "./Login.css";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  function validateForm() {
    return email.length > 0 && password.length > 0;
  }

  function handleSubmit(event) {
    event.preventDefault(); 

    const data={email,password}
    fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    .then((response) =>{
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
        //successful login
        localStorage.setItem('jwt',data.jwt)
        alert(data.message);
        navigate("/game");
      }
    })
    .catch((error) =>{
      alert(error);
      console.error("There was a problem with the fetch operation:", error);
    })

    


  }

  return (
    <div className="Login">
      <Form onSubmit={handleSubmit}>
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
        <Button block size="lg" type="submit" disabled={!validateForm()}>
          Login
        </Button>
      </Form>
      <p className="link">
            New user? <Link to='register'>Register</Link> Here.
      </p>
    </div>
  );
}
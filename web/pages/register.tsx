import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import styles from "../styles/Register.module.css";
import Header from "components/Header";

interface RegisterResponse {
  status: "SUCCESS" | "TAKEN" | "INVALID";
  message?: string;
}

const Register: NextPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");

  // check only at first render if the cookie is already present.
  useEffect(() => {
    const maybeUsernameCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_username="))
      ?.split("=")[1];
    if (!!maybeUsernameCookie) {
      console.log("User cookie exists, redirecting to app.");
      router.push("/home");
    }
    console.log("User cookie not found, they must register.");
  }, []);

  const handleSubmit = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();

    const registerUsername = username;
    const registerPayload = { username: registerUsername };
    // make call to register.
    fetch("/api/v1/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerPayload),
    })
      .then(async (resp) => {
        if (resp.status == 200) {
          const { status, message }: RegisterResponse = await resp.json();
          if (status != "SUCCESS") {
            console.log(
              "Could not register with username =",
              registerUsername,
              " because status =",
              status,
              "message =",
              message
            );
          } else {
            console.log(
              "Successfully registered with username = ",
              registerUsername
            );
            // redirect user to the app
            router.push("/home");
          }
        } else {
          console.error(
            "Could not register, got a non-200 response, status =",
            resp.status
          );
        }
      })
      .catch((reason) => {
        console.error("Could not register, reason=", reason);
      });
  };

  return (
    <div>
      <Head>
        <title>Login</title>
        <meta name="description" content="Login page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className={styles.container}>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <input type="submit" value="Login" />
        </form>
      </div>
    </div>
  );
};

export default Register;

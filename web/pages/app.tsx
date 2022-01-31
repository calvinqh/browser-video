import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import Router from "next/router";
import Chat from "components/Chat";

const App: NextPage = () => {
  const [username, setUsername] = useState<string | undefined>();

  // check and initialize user state
  useEffect(() => {
    // check if cookie is present, if not redirect user immediately.
    const maybeUsernameCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("user_username="))
      ?.split("=")[1];
    if (!!maybeUsernameCookie) {
      console.log("User is logged in");
      setUsername(maybeUsernameCookie);
    } else {
      console.log("User is not logged in, redirecting to register page");
      Router.push("/register");
    }

    // make request to retrieve user data
    // respond appropriately
    fetch("/api/v1/user", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (resp) => {
      if (resp.status == 401) {
        // note: the response should clear the cookies (include the user cookies)
        // if it doesn't, we may infinite redirect back and forth.
        console.log("User was not found, redirecting to register page...");
        Router.push("/register");
      }
      // todo: read the data ...., for now we just want to make sure that the user exists
    });
  }, [username]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Chat</title>
        <meta name="description" content="Chat application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <p>Hello, {username}</p>

      {/* Chat Component */}
      {!!username ? <Chat username={username} /> : <div>...</div>}
    </div>
  );
};

export default App;

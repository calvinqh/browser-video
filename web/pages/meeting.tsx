import type { NextPage } from "next";
import Head from "next/head";
import Header from "components/Header";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Meeting from "components/Meeting";

const MeetingPage: NextPage = () => {
  const router = useRouter();
  const { meetingId, method } = router.query;

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
      router.push("/register");
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
        router.push("/register");
      }
      // todo: read the data ...., for now we just want to make sure that the user exists
    });
  }, [username]);

  return (
    <>
      <Head>
        <title>Chat</title>
        <meta name="description" content="Chat application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className={styles.container}>
        <h1>....</h1>
        {!!username && !!meetingId ? (
          <Meeting username={username} meetingId={meetingId} method={method} />
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
};

export default MeetingPage;

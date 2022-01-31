import type { NextPage } from "next";
import Head from "next/head";
import Header from "components/Header";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import React, { useState, useEffect } from "react";

interface MeetingResponse {
  status: "OK" | "DOES_NOT_EXIST";
}

const Home: NextPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState<string | undefined>();
  const [targetMeetingId, setTargetMeetingId] = useState<string | undefined>();

  const handleJoinMeeting = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    console.log("Joining meeting: ", targetMeetingId);

    // TODO: validate input
    // redirect to meeting page
    router.push({
      pathname: "/meeting",
      query: { meetingId: targetMeetingId, method: "join" },
    });
  };

  const handleHostMeeting = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    console.log("Hosting meeting");

    // TODO: validate input
    // redirect to meeting page
    router.push({
      pathname: "/meeting",
      query: { meetingId: username, method: "host" },
    });
  };

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
    });
  }, [username]);

  return (
    <>
      <Head>
        <title>Home</title>
        <meta name="description" content="Home" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className={styles.container}>
        <p>Hello, {username}</p>
        <form className={styles.meetingForm} onSubmit={(e) => e.preventDefault}>
	  
	  <p>Join/Host Meeting with Signal</p>

          <button
            style={{gridColumn: "1 / 3"}}
            value="Host"
            onClick={handleHostMeeting}
          >
            Host
          </button>
          <button
            style={{gridColumn: "1 / 2", gridRow: "2"}}
            value="Join"
            onClick={handleJoinMeeting}
          >
            Join
          </button>
          <input
            style={{gridColumn: "2 / 3", gridRow: "2"}}
            type="text"
            placeholder="Meeting Id"
            onChange={(e) => setTargetMeetingId(e.currentTarget.value)}
          />
        </form>
      </div>
    </>
  );
};

export default Home;

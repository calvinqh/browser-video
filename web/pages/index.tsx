import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import Router from "next/router";
import Chat from "components/Chat";

const Index: NextPage = () => {
  // check and initialize user state
  useEffect(() => {
    Router.push("/register");
  });

  return (
    <div className={styles.container}>
      <h1>Get Outta Here!</h1>
    </div>
  );
};

export default Index;

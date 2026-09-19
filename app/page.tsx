"use client"

import React from "react";
import { redirectWithParams } from "../lib/redirect";

const AgeGate: React.FC = () => {
  function handleConfirm() {
    redirectWithParams("/conteudo")
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(to top, #2b1136, #77019a)",
        fontFamily: "Google Sans, sans-serif",
      }}
    >
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          height: 400,
          width: "80%",
          maxWidth: 400,
          background: "white",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          padding: 20,
          textAlign: "center",
        }}
      >
        <img
          src="/images/happy-hot-logo.svg"
          alt="Happy Hot"
          style={{
            width: 220,
            height: "auto",
            display: "block",
            alignSelf: "center",
            marginBottom: 30,
          }}
        />

        <h1 style={{ marginBottom: 10, color: "black", fontWeight: 700 }}>Confirmação de idade</h1>

        <p style={{ marginBottom: 20, color: "black" }}>
          Este conteúdo é destinado exclusivamente para maiores de 18 anos.
          Por favor, confirme sua idade para continuar.
        </p>

        <button
          onClick={handleConfirm}
          style={{
            padding: "10px 20px",
            background: "linear-gradient(to right, #2b1136, #77019a)",
            color: "white",
            border: "none",
            borderRadius: 5,
            cursor: "pointer",
            fontWeight: 500
          }}
        >
          Tenho mais de 18 anos
        </button>
      </main>
    </div>
  );
};

export default AgeGate;
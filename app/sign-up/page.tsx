import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <SignUp
        appearance={{
          elements: {
            rootBox: {
              boxShadow: "none",
              backgroundColor: "transparent",
            },
            card: {
              boxShadow: "none",
              backgroundColor: "transparent",
            },
          },
        }}
      />
    </div>
  );
}

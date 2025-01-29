import React from "react";
import {
  Flex,
  Box,
  Button,
  Text,
  Separator,
  TextField,
  Container,
} from "@radix-ui/themes";
import { Accordion } from "../../components/Accordion";
import { useLogin } from "../../hooks";

export const LoginPage: React.FC = () => {
  const { loginWithProvider } = useLogin();
  return (
    <Container p="8">
      <Accordion.Root type="multiple" defaultValue={["cloud"]}>
        <Accordion.Item value="cloud">
          <Accordion.Trigger>Refact Cloud</Accordion.Trigger>
          <Accordion.Content>
            <Box>
              <Text size="2">
                <ul>
                  <li>
                    Chat with your codebase powered by top models (e.g. Claude
                    3.5 Sonnet & GPT-4o with 32k context).
                  </li>
                  <li>Unlimited Code Completions (powered by Qwen2.5).</li>
                  <li>Codebase-aware vector database (RAG).</li>
                  <li>
                    Agentic features: browser use, database connect, debugger,
                    shell commands, etc.
                  </li>
                </ul>
              </Text>
            </Box>
            <Separator size="4" my="4" />
            <Flex direction="column" gap="3">
              <Button onClick={() => loginWithProvider("google")}>
                Continue with Google
              </Button>
              <Button onClick={() => loginWithProvider("github")}>
                Continue with GitHub
              </Button>

              <Text align="center">or</Text>

              <Flex asChild direction="column" gap="3">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);
                    const email = formData.get("email");
                    console.log(email);
                  }}
                >
                  <TextField.Root
                    placeholder="Email Address"
                    type="email"
                    name="email"
                    required
                  />
                  <Button type="submit">Send magic link</Button>
                  <Text size="1" align="center">
                    We will send you a one-time login link by email
                  </Text>
                </form>
              </Flex>
            </Flex>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="private">
          <Accordion.Trigger>Private Server</Accordion.Trigger>
          <Accordion.Content>
            <Box>
              <Text size="2">
                <ul>
                  <li>
                    User your own refact server (Enterprise or self-hosted).
                  </li>
                  <li>Fine-tune code completions to your codebase</li>
                  <li>Keep all code and data under your control.</li>
                </ul>
              </Text>
            </Box>
          </Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="byok">
          <Accordion.Trigger>Bring your own key</Accordion.Trigger>
          <Accordion.Content>
            <Box>
              <Text size="2">
                <ul>
                  <li>Connect to any OpenAI or Huggingface style server.</li>
                  <li>
                    Separate endpoints and keys for chat, completion, and
                    embedding.
                  </li>
                </ul>
              </Text>
            </Box>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Container>
  );
};

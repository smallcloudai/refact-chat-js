import { Flex, Text } from "@radix-ui/themes";

export type TourTitle = {
  title: string;
};

export function TourTitle({ title }: TourTitle) {
  return (
    <Flex direction="row" style={{ alignItems: "center" }}>
      <img src="favicon.png" width={28} height={28} />
      <Text
        style={{
          color: "black",
          fontSize: 16,
          margin: 4,
          paddingRight: 30,
        }}
      >
        {title}
      </Text>
    </Flex>
  );
}
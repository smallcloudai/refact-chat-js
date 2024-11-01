import { selectAddressURL, selectApiKey } from "../features/Config/configSlice";
import { smallCloudApi } from "../services/smallcloud";
import { useAppSelector } from "./useAppSelector";
// import { useGetUser } from "./useGetUser";

export function useGetUserSurvey() {
  // similar to getUser
  const addressURL = useAppSelector(selectAddressURL);
  const maybeApiKey = useAppSelector(selectApiKey);
  const apiKey = maybeApiKey ?? "";
  // console.log({ addressURL, maybeApiKey, apiKey });
  // TBD: wait until logged in
  const questionRequest = smallCloudApi.useGetSurveyQuery(apiKey, {
    skip: !maybeApiKey || addressURL !== "Refact",
  });

  const [postSurvey, postSurveyResult] = smallCloudApi.useLazyPostSurveyQuery();

  return {
    questionRequest,
    postSurvey,
    postSurveyResult,
  };
}

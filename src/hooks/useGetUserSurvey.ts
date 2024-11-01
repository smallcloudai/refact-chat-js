import { smallCloudApi } from "../services/smallcloud";
import { useGetUser } from "./useGetUser";

export function useGetUserSurvey() {
  const userData = useGetUser();

  const questionRequest = smallCloudApi.useGetSurveyQuery(undefined, {
    skip: userData.data?.retcode !== "OK",
  });

  const shouldOpen = true;

  const [postSurvey, postSurveyResult] = smallCloudApi.useLazyPostSurveyQuery();

  return {
    shouldOpen,
    questionRequest,
    postSurvey,
    postSurveyResult,
  };
}

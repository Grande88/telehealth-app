import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type PatientTabParamList = {
  HomeTab: undefined;
  NotificationsTab: undefined;
  ProfileTab: undefined;
};

export type PatientStackParamList = {
  PatientTabs: NavigatorScreenParams<PatientTabParamList>;
  HospitalList: undefined;
  HospitalDetails: { hospitalId: string };
  SubmitFeedback: { hospitalId: string };
  FeedbackHistory: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Patient: NavigatorScreenParams<PatientStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

type StandBy = {
  tag: "standby";
};

type Loading = {
  tag: "loading";
};

type Success<T> = {
  tag: "success";
  data: T;
};

type Failure = {
  tag: "failure";
  error?: any;
};

type Result<T> = Success<T> | Failure | Loading | StandBy;

const standby: StandBy = { tag: "standby" };

const failure = (error?: any): Failure => ({ tag: "failure", error });

const success = <T>(data: T): Success<T> => ({ tag: "success", data });

const loading: Loading = { tag: "loading" };

export {
  type Result,
  type Success,
  type Failure,
  type Loading,
  type StandBy,
  standby,
  loading,
  failure,
  success,
};

export interface ResponseSDP {
  response_status: ResponseStatus[];
  list_info: ListInfo;
  users: User[];
}

export interface ListInfo {
  has_more_rows: boolean;
  start_index: number;
  row_count: number;
  total_count: number;
}

export interface ResponseStatus {
  status_code: number;
  status: string;
}

export interface User {
  email_id: null;
  extension: null;
  purchase_approver: boolean | null;
  ci_people_fields: CiPeopleFields;
  description: string;
  is_vipuser: boolean;
  reporting_to: null;
  type: string;
  citype: Citype;
  cost_per_hour: string;
  ci_default_fields: CiDefaultFields;
  can_generate_authtoken: boolean;
  org_user_status: string;
  id: string;
  department: null;
  first_name: null | string;
  service_request_approver: null;
  created_time: CreatedTime;
  is_technician: boolean;
  jobtitle: null;
  mobile: null | string;
  profile_pic: ProfilePic;
  project_roles: ProjectRoles | null;
  last_name: null | string;
  sms_mail_id: null;
  middle_name: null | string;
  created_by: CreatedBy | null;
  ciid: string;
  purchase_approval_limit: null | string;
  login_name: null | string;
  requester_allowed_to_view?: null;
  phone: null | string;
  sip_user: null;
  employee_id: string;
  domain: null;
  name: string;
  enable_telephony: boolean;
  status: string;
}

export interface CiDefaultFields {
  udf_pickref_1: null;
}

export interface CiPeopleFields {}

export interface Citype {
  name: string;
  id: number;
}

export interface CreatedBy {
  email_id: null;
  phone: string;
  name: string;
  mobile: string;
  profile_pic: ProfilePic;
  is_vipuser: boolean;
  id: string;
  department: null;
}

export interface ProfilePic {
  "content-url": string;
}

export interface CreatedTime {
  display_value: string;
  value: string;
}

export interface ProjectRoles {
  name: string;
  id: string;
}

export interface UserEpmap {
  ZNAME_EMP: string;
  ZTGEREN: string;
  ZTORGEH: string;
  ZTPLANS: string;
  ZNAME_JF: string;
  ZTPLANS_JF: string;
}

export interface UserSdp {
  id: string;
  email_id: null;
  name: string;
};
import {ValidateRule, UserInfo} from "./Interfaces";

export const CONST_VAR =  {
	ERR_MSG: {
		unexpected_error: "予期せぬエラーが発生しました",
	}
};

export class MyError extends Error {
	public redirectTmpl: string;
	public user: UserInfo;
	constructor(msg: string, tmpl: string, user: UserInfo) {
		super(msg);
		this.redirectTmpl = tmpl;
		this.user = user;
	}

}

export class MyUtil {
	static validate(rules: ValidateRule[], tmpl: string, obj: any) {
		for ( let {rule, msg} of rules) {
			if (!rule) {
				const errMsg = msg ? msg : CONST_VAR.ERR_MSG.unexpected_error;
				throw new MyError(errMsg, tmpl, obj);
			}
		}
	}
}
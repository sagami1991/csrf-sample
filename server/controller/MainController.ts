import {Express, Request, Response, NextFunction} from 'express';
import {UserInfo} from "../share/Interfaces";
import {UserRepository} from "../repository/UserRepository";
import {MyUtil} from "../share/serverUtil";

export class MainController {
	constructor(private app: Express,
				private userRepository: UserRepository) {};
	public init() {
		this.setGlobalVar();
		this.app.use('/mypage/**', (req, res, next) => this.sessionCheck(req, res, next));
		this.app.get('/', (req, res) => this.top(req, res));
		this.app.get('/login-page', (req, res) => this.loginPage(req, res));
		this.app.get('/logout', (req, res) => this.logout(req, res));
		this.app.post('/login', (req, res) => this.login(req, res));
		this.app.get('/users', (req, res) => this.usersPage(req, res));
		this.app.get('/register-page', (req, res) => this.registerPage(req, res));
		this.app.post('/register', (req, res) => this.register(req, res));
		this.app.get('/mypage/top', (req, res) => this.myPage(req, res));
		this.app.get('/mypage/edit-page', (req, res) => this.myInfoEditPage(req, res));
		this.app.post('/mypage/edit', (req, res) => this.myInfoEdit(req, res));
	}

	private setGlobalVar() {
		this.app.locals.pages = [
			{link: "/", text: "トップ"},
			{link: "/login-page", text: "ログイン"},
			{link: "/logout", text: "ログアウト"},
			{link: "/register-page", text: "会員登録"},
			{link: "/mypage/top", text: "マイ"},
			{link: "/mypage/edit-page", text: "会員情報編集"},
			{link: "/users", text: "ユーザー一覧"},
		]
	}

	private sessionCheck(req: Request, res: Response, next: NextFunction) {
		if (req.session["user"]) {
			res.locals.session = req.session;
			next();
		} else {
			res.redirect('/login-page');
		}
	}

	/** トップページ */
	private top(req: Request, res: Response) {
		res.render("top");
	}
	/** ログインページ */
	private loginPage(req: Request, res: Response) {
		res.render("login-page");
	}

	/** 会員登録ページ */
	private registerPage(req: Request, res: Response) {
		res.render("register-page");
	}

	/** マイページ */
	private myPage(req: Request, res: Response) {
		res.render("mypage", {user: req.session["user"]});
	}

	/** 会員修正ページ */
	private myInfoEditPage(req: Request, res: Response) {
		res.render("my-edit-page", {user: req.session["user"]});
	}

	/** ユーザー一覧ページ */
	private usersPage(req: Request, res: Response) {
		this.userRepository.findAllForList().toArray((err, arr) => {
			res.render("users", {users: arr});
		});
	}
	/** 会員登録実行 */
	private register(req: Request, res: Response) {
		const reqUserInfo = <UserInfo> req.body;
		this.validateUserInfo(reqUserInfo, res, "register-page");
		this.userRepository.findOne(reqUserInfo.userId).then(result => {
			if (result) {
				res.render("register-page", {errorMsg: "既に存在するユーザーです"});
			} else {
				this.userRepository.addOne(reqUserInfo).then(() => {
					req.session["user"] = reqUserInfo;
					res.redirect("/mypage/top");
				});
			}
		});
	}

	/** ログイン実行 */
	private login(req: Request, res: Response) {
		const reqUserInfo = <UserInfo> req.body;
		this.validateUserInfo(reqUserInfo, res, "login-page");
		this.userRepository.findByUserInfo(reqUserInfo).then(result => {
			if (result) {
				req.session["user"] = reqUserInfo;
				res.redirect("/mypage/top");
			} else {
				res.render("login-page", {errorMsg: "存在しないユーザーです"});
			}
		});
	}

	/** ログアウト実行 */
	private logout(req: Request, res: Response) {
		req.session["user"] = undefined;
		res.render("logout");
	}

	/** 会員情報修正 */
	private myInfoEdit(req: Request, res: Response) {
		const reqUserInfo = <UserInfo> req.body;
		this.validateUserInfo(reqUserInfo, res, "my-edit-page");
		reqUserInfo._id = req.session["user"]._id;
		this.userRepository.updateOne(reqUserInfo).then(result => {
			req.session["user"] = reqUserInfo;
			res.render("my-edit-page", {errorMsg: "変更しました。", user: reqUserInfo});
		});
	}


	/**バリデーション */
	private validateUserInfo(reqBody: UserInfo, res: Response, renderTmpl: string) {
		MyUtil.validate([
			{ rule: typeof reqBody.userId === "string"},
			{ rule: reqBody.userId.length > 0, msg: "ユーザーIDが未入力です"},
			{ rule: reqBody.userId.length < 24, msg: "ユーザーIDは24文字以内で入力してください"},
			{ rule: typeof reqBody.password === "string"},
			{ rule: reqBody.password.length > 0, msg: "パスワードが未入力です"},
			{ rule: reqBody.password.length < 24, msg: "パスワードは24文字以内で入力してください"},
		], renderTmpl, reqBody);
	}
}
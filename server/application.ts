/** Webアプリの根本ページ */

import 'source-map-support/register'; // エラー時、tsファイルの行数を教える
import {createServer}  from 'http';
import * as express from 'express';
import {Express, Request, Response} from 'express';
import * as exphbs from 'express-handlebars';
import {MainController} from "./controller/MainController";
import {UserRepository} from "./repository/UserRepository";
import {MongoClient, Db} from 'mongodb';
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as session from "express-session";
import {MyUtil, MyError} from "./share/serverUtil";

class Application {
	private static db: Db;
	public static main() {
		this.connectDatabase().then(() => {
			const app = express();
			this.setAppSetting(app);
			this.startSever(app);
		});
	}

	/** Webサーバーの起動 */
	private static startSever(app: Express) {
		const server = createServer();
		server.on('request', app);
		server.listen(process.env.PORT || 3000, () => console.log(`server on port ${server.address().port}`));
	}

	/** DB接続 */
	private static connectDatabase() {
		return new Promise<Db>(resolve => {
			MongoClient.connect(process.env.MONGODB_URI , (err, db) => {
				if (err) throw err;
				console.log(`success connect Mongodb ${db.databaseName}`);
				this.db = db;
				resolve();
			});
		});
	}

	private static initControllers(app: Express) {
		const userRepository = new UserRepository(this.db.collection("csrf-users"));
		new MainController(app, userRepository).init();
	}

	/** Webアプリ設定 */
	private static setAppSetting(app: Express) {
		// templateエンジンの設定
		this.setTemplateEngine(app);
		// cookie有効
		app.use(cookieParser());
		// セッション使用
		app.use(session({
			secret: 'keyboard cat',
			resave: false,
			saveUninitialized: false,
			cookie: {maxAge: 30 * 60 * 1000 }
		}));
		// jsonのリクエスト有効
		app.use(bodyParser.urlencoded({ extended: false }));
		app.use(bodyParser.json());
		this.initControllers(app);
		// エラーハンドリング
		app.use((err: Error, req: Request, res: Response, next: express.NextFunction) => {
			res.status(500);
			if (err instanceof MyError) {
				res.render(err.redirectTmpl, { errorMsg: err.message, user: err.user});
			} else {
				res.send({message: err.message});
			}
		});
		// 静的ファイル設定
		// app.use(express.static(__dirname + '/public'));
	}

	/** テンプレートエンジンの設定 */
	private static setTemplateEngine(app: Express) {
		app.engine('.hbs', exphbs({
			defaultLayout: "layout",
			extname: ".hbs",
			layoutsDir: `${__dirname}/templates`,
		}));
		app.set('views', `${__dirname}/templates`);
		app.set('view engine', '.hbs');
	}

}

Application.main();
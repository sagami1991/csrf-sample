import {Collection, ObjectID} from 'mongodb';
import {UserInfo} from "../share/Interfaces";

export class UserRepository {
	constructor(private users: Collection) {}

	public findOne(userId: string): Promise<UserInfo> {
		return this.users.findOne({userId: userId});
	}

	public findByUserInfo(user: UserInfo) {
		return this.users.findOne({userId: user.userId, password: user.password});
	}

	public findAllForList() {
		return this.users.find({}, {});
	}

	public addOne(user: UserInfo) {
		return this.users.insertOne(user);
	}

	public updateOne(user: UserInfo) {
		return this.users.updateOne({
			_id: new ObjectID(user._id),
		}, {
			$set: {
				userId: user.userId,
				password: user.password
			}
		});
	}

	public deleteOne(id: string, userId: string) {
		return this.users.deleteOne({
			_id: new ObjectID(id),
			userId: userId
		});
	}


}
## Route Incoming Calls to Users

Incoming calls are routed to users with a default strategy after installation, please see section [Call Routing Strategy - First User](#call-routing-strategy---first-user) for details.

You find two examples for a call routing strategy in `PhoneInboundController.ts`. Please note to change the strategy you need to update the source and link the route in `worker.ts`.

```javascript
callback.route('/accounts/:accountId/phone/inbound').post(PhoneInboundController.handleConnectToUser);
```

This is the default controller configured for incoming phone calls. Update it to the controller you want to handle inbound calls.

```javascript
callback.route('/accounts/:accountId/phone/inbound').post(myIncomingCallHandler);
```

### User Activity and Availability

There are two activities a phone user can toggle on the UI, `waiting-for-work` and `away`. The enum values for the activities are listed in `UserActivity.ts`.

The user model has a method to check if a user is available to handle a phone call. The backend will determine if a user is available with the code below.

```typescript
get isAvailable(): boolean {
	return this.activity === UserActivity.WaitingForWork && !this.call;
}
```

### Call Routing Strategy - First User

This route is defined in `PhoneInboundController.handleConnectToUser`. Incoming phone calls are routed to the first user that is `online` and `available`. A user is `online` if the browser has an open WebSocket to the server.

In case no user is found in the list of connected users, the strategy will fetch the first user from the user database and assign the missed call to this user. This routing stategy is useful in a single user environment, missed calls will be assigned to a user directly and not to the account. All missed calls to an account are stored on the user's call history.

### Call Routing Strategy - Random Online User.

This strategy is defined in`PhoneInboundController.handleConnectWithFilter`. Incoming phone calls are routed to a random user that is `online` and `available`.

```typescript
let users: Array<User> = pool.getOnlineByAccount(req.account);

users = users.filter((user) => user.isAvailable);
```

If the list of users found is greater than zero, a random user is picked and the call is connected, if the filtered list of users is empty the call is rejected.

#### Filter Users by Tag

Additionally you can filter the list of users with a tag `tag` and route calls only to a small group of users or to an individual. In the example below the user has two tags, `mechanic` and `support`.

```json
{
  "id": "3d052277-9423-4f27-a121-ece1551a29d7",
  "name": "Alice",
  "tags": ["mechanic", "support"]
}
```

If we want to connect inbound calls to users with a `tag`, add it to the phone number webhook on Twilio as a GET parameter.

```
/accounts/:accountId/phone/inbound?tag=mechanic
```

In the webhook example above, the tag is set to `mechanic`, the routing stategy will filter `online` users by this tag and only route to this group.

Please note, the setup script will always configure the webhook without any tags. If you use tags, do not execute the setup again after you manually set it, instead let the setup script run once and afterwards set the tag on the phone number.

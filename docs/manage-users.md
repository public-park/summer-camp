## Manage Users

The project supports basic role-based access. Each user has a `roles` attribute with the value
`agent` or `owner`. Based on the role, a set of permissions is assigned to the user. Permissions grant access to the API endpoints, for example `calls.read` allows to fetch the list of calls. You find the available roles in `src-server/model/roles`. The list of permissions is defined in `src-server/models/roles/Permission.ts`.

On the phone UI the role will manage the top level navigation, the corresponding React component is `/src/components/Workspace/Header/Headers.tsx`.

### Adding non-privileged Users

You can create new users via RESTful API. There are many ways how to make a HTTP request. If you want to add users once, you can simply use an API client, for example [Insomnia](https://insomnia.rest/). The repository contains a [Summer Camp OpenAPI](https://github.com/public-park/summer-camp/blob/master/api-summer-camp.yaml) file, this definition file can be imported with many tools and it will generate requests automatically for you.

#### Obtain a JWT Token

First we need a valid JWT token to authenticate on the API. Send a login request with a user who has an `owner` role to the authentication endpoint.

POST **<base-url>/login**

Request Body

```
{
	"name": "Bob",
	"password": "my-secret"
}
```

Response

```
{
  "token": "....",
  "userId": "3d052277-9423-4f27-a121-ece1551a29d7"
  "accountId": "4d8b25ff-2b69-47ef-9ed0-3db8ae27bee5"
}
```

#### Create the User

With the returned token we can now create a non-privileged user. The requests to the API must contain the authentication details.

Add the JWT token to the HTTP header as `Token` field value.

The`tags` element is an optional array you can use to route a call to a specific agent. The default `role` the API will set is `agent` if not set in the request.

You can override it in your request. Don't forget to set the name and password.

POST **<base-url>/users**

Header

```
Token: eyJhbGciOiJIUzI1NiIs...
```

Request Body

```
{
  "name": "Alice",
  "password": "my-first-password",
}
```

Request Body with Optional Parameters

```
{
  "name": "Alice",
  "password": "my-first-password",
  "tags": [
    "fr", "en"
  ],
  "activity": "waiting-for-work"
  "role": "agent"
}
```

Response

```
{
  "id": "3d052277-9423-4f27-a121-ece1551a29d7",
  "name": "Alice",
  "profileImageUrl": null,
  "tags": [
    "none"
  ],
  "activity": "waiting-for-work",
  "accountId": "4d8b25ff-2b69-47ef-9ed0-3db8ae27bee5",
  "authentication": {
    "provider": "local-password"
  },
  "role": "owner",
  "createdAt": "2020-04-14T09:25:25.477Z"
}
```

You have successfully created a user, the new user can login and use the application.

#### The Owner Role

The `owner` role has unrestricted access to the RESTful API. With this role you can

- read, create, update and delete any users
- read, create and update the account configuration
- read the account details
- read, update and delete calls

#### The Agent Role

The `agent` role is a non-privileged role to use the phone without any administrative permissions.

- read all users
- read calls

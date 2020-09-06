Call data is stored in a document structure, for each call a single document is created. Not all values are available at all stages of a call, for example the `duration` is saved after the call is completed.

| Field     | Description                                                                                                                                      |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| id        | unique identifier of the call                                                                                                                    |
| callSid   | Twilio [callSid](https://support.twilio.com/hc/en-us/articles/223180488-What-is-a-Call-SID-)                                                     |
| from      | origination of the call in [E.164 format](https://en.wikipedia.org/wiki/E.164)                                                                   |
| to        | destination of the call in [E.164 format](https://en.wikipedia.org/wiki/E.164)                                                                   |
| accountId | unique account identifier                                                                                                                        |
| userId    | unique id of the user that handled the call                                                                                                      |
| status    | status of the call, possible values are, `initiated`, `ringing`, `no-answer`, `in-progress`, `completed`, `busy`, `failed`, `canceled`, `queued` |
| direction | `inbound` or `outbound`                                                                                                                          |
| duration  | length of the call in seconds                                                                                                                    |
| createdAt | timestamp when the call was created                                                                                                              |

Examples

```json
{
  "id": "bec8aec9-a863-4b39-83f7-fed54b0e501e",
  "callSid": "CA....",
  "from": "+44...",
  "to": "+42....",
  "accountId": "9381e19c-9c55-4f14-bfa0-d292039c2e96",
  "userId": "73c121ca-ef64-4d5c-adc5-763b1c9f2d6c",
  "status": "completed",
  "direction": "outbound",
  "duration": 452,
  "createdAt": "2020-08-03T18:39:55.847Z"
}
```

```json
{
  "id": "db862171-d30c-4785-adfe-28e8081b395e",
  "callSid": "CA....",
  "from": "+41...",
  "to": "+43...",
  "accountId": "4d8b25ff-2b69-47ef-9ed0-3db8ae27bee5",
  "status": "no-answer",
  "direction": "inbound",
  "createdAt": "2020-08-03T18:43:09.145Z"
}
```

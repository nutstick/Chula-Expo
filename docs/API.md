# API Docs

## Log in with facebook (Web)
```
GET api/auth/facebook
```

## Log in with facebook (Andriod, iOS)
```
GET api/auth/facebook/token
```
Name | Datatype | required | Description
-----|----------|----------|------------
access_token | string | true | Facebook access token.

ex. `/auth/facebook/token?access_token=<TOKEN_HERE>`

### Results #1: Account doesn't exist
Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | false | Not success request
errors.code | number | 2 | Error code
errors.message | string | First time Signup, need to provied more data | Server response message
user | Object | *up to request* | User detail retrieve from facebook

### Results #2: Successful login
Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
message | string | User already exist, login success | Successful message
results.token | string | *up to request* | JWT Token use to communicate with API

## Sign Up
```
POST api/signup
```
Name | Datatype | required | Description
-----|----------|----------|------------
email | string  | true | Email
password | string | false | Password
facebook | string | false | Facebook ID
google | string | false | Google ID
tokens | object[] | false | Array of token from provider in format of `{ kind: [Provider], accessToken: [AccessToken]}`
name | string | true | Name
string | string | true | Gender [Male/Female/Other]
age | number | true | Age
profile | string | true | Profile picture URL (full-url if frome facebook.com)
type | string | true | User Type [Academic/Worker/Staff]
tags | string | false | Interesting tags in format of `abc,bcd,cde` (seperate each tags by `,`)
academicLevel | string | isAcademic? | Academic Level
academicYear | string | isAcademic? | Year of yor education
academicSchool | string | isAcademic? | School name
workerJob | string | isWorker? | Job
staff | string | isStaff? | Staff Type [Staff/Scanner/Admin]
registationCode | string | isStaff? | Registation Code
zone | ObjectId | isStaff? | Staff's zone

### Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
message | string | User sign up successfull! | Successful message
results.token | string | *up to request* | JWT Token use to communicate with API


## Rounds
```java
 * @return {boolean} success - Successful querying flag.
 * @return {Round[]} results - Result rounds for the query.
 * @return {Object} queryInfo - Metadat query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that matched.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 */
GET api/rounds
```

Name | Datatype | required | Description
-----|----------|----------|------------
name | string | false | Get by rounds's name
activityId | ObjectId | false | Get by belong to activty
userId | ObjectId | false | Get by belong to user
ticketId | ObjectId | false | Get by belong to ticket
start | Date or RangeQuery(Date) | false | Get by start date
end | Date or RangeQuery(Date) | false | Get by end date
seatsAvaliable | number or RangeQuery(number) | false | Get by avaliable seats left
sort | string | false | Sorted by field name (more of [sort](./api-helper.md#sort)
fields | string | false | Get only specific fields (more of [sort](./api-helper.md#fields)
limit | number | false | Number of item per query (more of [sort](./api-helper.md#limit)
skip | number | false | Offset items after sorted (more of [sort](./api-helper.md#skip)
### Accessible fields
 * name
 * activityId
 * start
 * end
 * fullCapacity
 * seatsAvaliable
 * seatsReserved

```java
/**
 * Create Round
 * @param {string} name - Round name.
 * @param {ObjectId} activityId - Related activity id.
 * @param {Date} start - Start time of round.
 * @param {Date} end - End time of round.
 * @param {number} [seatsReserved] - Number of reserved seats.
 * @param {number} fullCapacity - Number of full capacity seats.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Object} round - Created Round.
 */
 POST api/rounds
```
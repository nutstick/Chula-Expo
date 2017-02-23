# API Docs

### [API helper faqs เบื้้องต้นก่อนใช้ API](./api-helper.md)

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

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
message | string | User sign up successfull! | Successful message
results.token | string | *up to request* | JWT Token use to communicate with API

## Me

**All methods below (`/me`) required token in header (more of [Authorization](./api-helper.md#header-authorization))**
```
GET api/me
```
Name | Datatype | required | Description
-----|----------|----------|------------
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
Accessible fields
 * _id
 * name
 * email
 * age
 * gender
 * profile
 * type 
 * academic (You can select this field even data doesn't exist)
 * worker (You can select this field even data doesn't exist)
 * staff (You can select this field even data doesn't exist)

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | User | *up to request* | Result user detail from query

<p></p><hr></hr>

```
PUT api/me
```
Name | Datatype | required | Description
-----|----------|----------|------------
email | string  | true | Email
name | string | true | Name
string | string | true | Gender [Male/Female/Other]
age | number | true | Age
profile | string | true | Profile picture URL (full-url if frome facebook.com)
type | string | true | User Type [Academic/Worker/Staff]
academicLevel | string | isAcademic? | Academic Level
academicYear | string | isAcademic? | Year of yor education
academicSchool | string | isAcademic? | School name
workerJob | string | isWorker? | Job
staff | string | isStaff? | Staff Type [Staff/Scanner/Admin]
registationCode | string | isStaff? | Registation Code
zone | ObjectId | isStaff? | Staff's zone

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
message | string | Update user infomation successfull | Success request message
results | User | *up to request* | Result user detail from query

<p></p><hr></hr>

```
GET api/me/reserved_rounds
```
Name | Datatype | required | Description
-----|----------|----------|------------
name | string | false | Get by rounds's name
start | [Date](./api-helper.md#date) or [RangeQuery(Date)](./api-helper.md#rangequery) | false | Get by start date
end | [Date](./api-helper.md#date) or [RangeQuery(Date)](./api-helper.md#rangequery) | false | Get by end date
sort | string | false | Sorted by field name (more of [sort](./api-helper.md#sort))
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
limit | number | false | Number of item per query (more of [limit](./api-helper.md#limit-skip))
skip | number | false | Offset items after sorted (more of [skip](./api-helper.md#limit-skip))
Accessible fields
 * name
 * activityId
 * start
 * end
 * fullCapacity
 * seatsAvaliable
 * seatsReserved
 * checked
 * sized

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Round[] | *up to request* | Result round + checked flag and reserve size from query
queryInfo.total | number | *up to request* | Total numbers of items in query
queryInfo.limit | number | *up to request* | Limit that was used
queryInfo.skip | number | *up to request* | Skip that was used
queryInfo.user | ObjectId | *up to request* | User's used to query

<p></p><hr></hr>

```
GET api/me/reserved_rounds/:rid
```
Name | Datatype | required | Description
-----|----------|----------|------------
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Round[] | *up to request* | Result round from query
queryInfo.user | ObjectId | *up to request* | User's used to query
queryInfo.round | ObjectId | *up to request* | Round's used to query

<p></p><hr></hr>

```
DELETE api/me/reserved_rounds/:rid
```

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Successful request
message | string | Successfully cancel reserved round | Successful message

## Activity
```
GET api/activities
```
Name | Datatype | required | Description
-----|----------|----------|------------
name | string | false | Get by name
tags | string | false | Get by tags
zone | ObjectId | false | Get by zone
start | [Date](./api-helper.md#date) or [RangeQuery(Date)](./api-helper.md#rangequery) | false | Get by start time
end | [Date](./api-helper.md#date) or [RangeQuery(Date)](./api-helper.md#rangequery) | false | Get by start end
location | string | false | Get by location name
sort | string | false | Sorted by field name (more of [sort](./api-helper.md#sort))
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
limit | number | false | Number of item per query (more of [limit](./api-helper.md#limit-skip))
skip | number | false | Offset items after sorted (more of [skip](./api-helper.md#limit-skip))
Accessible fields
 * nameEN - string
 * [nameTH] - string
 * thumbnail - Url
 * banner - Url
 * shortDescriptionEN
 * [shortDescriptionTH]
 * descriptionEN
 * [descriptionTH]
 * contact - string
 * pictures - Url[]
 * video
 * pdf  - Url
 * link - Url
 * isHighlight - boolean
 * tags - string[]
 * locationPlace
 * locationFloor
 * locationRoom
 * locationLat
 * locationLong
 * zone - Zone's Object
 * start - Date
 * end - Date

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Activity[] | *up to request* | Result activities from query
queryInfo.total | number | *up to request* | Total numbers of items in query
queryInfo.limit | number | *up to request* | Limit that was used
queryInfo.skip | number | *up to request* | Skip that was used

<p></p><hr></hr>

```
GET api/activities/:aid
```
Name | Datatype | required | Description
-----|----------|----------|------------
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
Accessible fields
 * nameEN - string
 * [nameTH] - string
 * thumbnail - Url
 * banner - Url
 * shortDescriptionEN
 * [shortDescriptionTH]
 * descriptionEN
 * [descriptionTH]
 * contact - string
 * pictures - Url[]
 * video
 * pdf  - Url
 * link - Url
 * isHighlight - boolean
 * tags - string[]
 * locationPlace
 * locationFloor
 * locationRoom
 * locationLat
 * locationLong
 * zone - Zone's Object
 * start - Date
 * end - Date

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Activity | *up to request* | Result activity from query


## Activity's Round
```
GET api/activities/:aid/rounds
```
Name | Datatype | required | Description
-----|----------|----------|------------
name | string | false | Get by name
start | [Date](./api-helper.md#date) or [RangeQuery(Date)](./api-helper.md#rangequery) | false | Get by start date
end | [Date](./api-helper.md#date) or [RangeQuery(Date)](./api-helper.md#rangequery)) | false | Get by end date
seatsAvaliable | number or [RangeQuery(number)](./api-helper.md#rangequery) | false | Get by avaliable seats left
sort | string | false | Sorted by field name (more of [sort](./api-helper.md#sort))
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
limit | number | false | Number of item per query (more of [limit](./api-helper.md#limit-skip))
skip | number | false | Offset items after sorted (more of [skip](./api-helper.md#limit-skip))
Accessible fields
 * nameTH
 * nameEN
 * start
 * end
 * seatsFulCapacity
 * seatsReserved
 * seatsAvaliable

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Round[] | *up to request* | Result rounds from query
queryInfo.total | number | *up to request* | Total numbers of items in query
queryInfo.limit | number | *up to request* | Limit that was used
queryInfo.skip | number | *up to request* | Skip that was used

<p></p><hr></hr>

```
POST api/activities/:aid/rounds/:rid/reserve
```
**This method required token in header (more of [Authorization](./api-helper.md#header-authorization))**

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
message | string | Create Ticket Successful | Successful message
results | Ticket | *up to request* | Result ticket that create by reserve action

```
DELETE api/activities/:aid/rounds/:rid/reserve
```
**This method required token in header (more of [Authorization](./api-helper.md#header-authorization))**

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
message | string | Successfully cancel reserved round. | Successful message

## Rounds
```
GET api/rounds
```

Name | Datatype | required | Description
-----|----------|----------|------------
name | string | false | Get by rounds's name
activityId | ObjectId | false | Get by belong to activty
userId | ObjectId | false | Get by belong to user
ticketId | ObjectId | false | Get by belong to ticket
start | [Date](./api-helper.md#date) or [RangeQuery(Date)](./api-helper.md#rangequery) | false | Get by start date
end | [Date](./api-helper.md#date) or [RangeQuery(Date)](./api-helper.md#rangequery) | false | Get by end date
seatsAvaliable | number or [RangeQuery(number)](./api-helper.md#rangequery) | false | Get by avaliable seats left
sort | string | false | Sorted by field name (more of [sort](./api-helper.md#sort))
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
limit | number | false | Number of item per query (more of [limit](./api-helper.md#limit-skip))
skip | number | false | Offset items after sorted (more of [skip](./api-helper.md#limit-skip))
Accessible fields
 * name
 * activityId
 * start
 * end
 * fullCapacity
 * seatsAvaliable
 * seatsReserved

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Round[] | *up to request* | Result round from query
queryInfo.total | number | *up to request* | Total numbers of items in query
queryInfo.limit | number | *up to request* | Limit that was used
queryInfo.skip | number | *up to request* | Skip that was used

## Zone
```
GET api/zones
```
Name | Datatype | required | Description
-----|----------|----------|------------
name | string | false | Get by name
type | string | false | Get by type
shortName | String  | false | Get by zone
sort | string | false | Sorted by field name (more of [sort](./api-helper.md#sort))
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
limit | number | false | Number of item per query (more of [limit](./api-helper.md#limit-skip))
skip | number | false | Offset items after sorted (more of [skip](./api-helper.md#limit-skip))
Accessible fields
 * nameEN - string
 * [nameTH] - string
 * shortNameEN - string
 * [shortNameTH] - string
 * thumbnail - Url
 * banner - Url
 * descriptionEN - string
 * [descriptionTH] - string
 * welcomeMessageEN - string
 * [welcomeMessageTH] - string
 * type - string
 * website - string
 * locationLat
 * locationLong

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Zone[] | *up to request* | Result zones from query
queryInfo.total | number | *up to request* | Total numbers of items in query
queryInfo.limit | number | *up to request* | Limit that was used
queryInfo.skip | number | *up to request* | Skip that was used

<p></p><hr></hr>

```
GET api/zones/:zid
```
Name | Datatype | required | Description
-----|----------|----------|------------
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
Accessible fields
* nameEN - string
* [nameTH] - string
* shortNameEN - string
* [shortNameTH] - string
* thumbnail - Url
* banner - Url
* descriptionEN - string
* [descriptionTH] - string
* welcomeMessageEN - string
* [welcomeMessageTH] - string
* type - string
* website - string
* locationLat
* locationLong

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Zone | *up to request* | Result zone from query

## Facility
```
GET api/facilities
```
Name | Datatype | required | Description
-----|----------|----------|------------
name | string | false | Get by name
type | string | false | Get by type
place | ObjectId | false | Get by place
sort | string | false | Sorted by field name (more of [sort](./api-helper.md#sort))
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
limit | number | false | Number of item per query (more of [limit](./api-helper.md#limit-skip))
skip | number | false | Offset items after sorted (more of [skip](./api-helper.md#limit-skip))
Accessible fields
 * nameEN - string
 * [nameTH] - string
 * descriptionEN - string
 * [descriptionTH] - string
 * type - string
 * place - Place's Object
 * locationLat
 * locationLong

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Facility[] | *up to request* | Result facilities from query
queryInfo.total | number | *up to request* | Total numbers of items in query
queryInfo.limit | number | *up to request* | Limit that was used
queryInfo.skip | number | *up to request* | Skip that was used

<p></p><hr></hr>

```
GET api/facilities/:fid
```
Name | Datatype | required | Description
-----|----------|----------|------------
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
Accessible fields
 * nameEN - string
 * [nameTH] - string
 * descriptionEN - string
 * [descriptionTH] - string
 * type - string
 * place - Place's Object
 * locationLat
 * locationLong

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Facility | *up to request* | Result facility from query

## Place
```
GET api/places
```
Name | Datatype | required | Description
-----|----------|----------|------------
name | string | false | Get by name
code | string | false | Get by code
sort | string | false | Sorted by field name (more of [sort](./api-helper.md#sort))
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
limit | number | false | Number of item per query (more of [limit](./api-helper.md#limit-skip))
skip | number | false | Offset items after sorted (more of [skip](./api-helper.md#limit-skip))
Accessible fields
 * nameEN - string
 * [nameTH] - string
 * code - string
 * locationLat
 * locationLong

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Place[] | *up to request* | Result places from query
queryInfo.total | number | *up to request* | Total numbers of items in query
queryInfo.limit | number | *up to request* | Limit that was used
queryInfo.skip | number | *up to request* | Skip that was used

<p></p><hr></hr>

```
GET api/places/:pid
```
Name | Datatype | required | Description
-----|----------|----------|------------
fields | string | false | Get only specific fields (more of [fields](./api-helper.md#fields))
Accessible fields
 * nameEN - string
 * [nameTH] - string
 * code - string
 * locationLat
 * locationLong

Successful Results

Name | Datatype | Value | Description
-----|----------|-------|------------
success | boolean | true | Success request
results | Place | *up to request* | Result place from query

##RESTFUL API

Refreshing token
```
GET api/token
```

## Activity's Rounds
```java
/**
 * Get Activity's Rounds
 * @param {string} [name] - Get matched round's name.
 * @param {ObjectId} [activityId] - Get by matches activity ID.
 * @param {ObjectId} [userId] - Get rounds own by user.
 * @param {ObjectId} [ticketId] - Get round of ticket.
 * @param {Date | RangeQuery<Date>} [start] - Get by start time.
 * @param {Date | RangeQuery<Date>} [end] - Get by end time.
 * @param {number | RangeQuery<number>} [seatsAvaliable] - Get by avaliable seats.
 * @param {string} [sort] - Sort fields (ex. "-start,+createAt").
 * @param {string} [fields] - Fields selected (ex. "name,fullCapacity").
 * @param {number} [limit] - Number of limit per query.
 * @param {number} [skip=0] - Offset documents.
 *
 * @return {boolean} success - Successful querying flag.
 * @return {Round[]} results - Result rounds for the query.
 * @return {Object} queryInfo - Metadat query information.
 * @return {number} queryInfo.total - Total numbers of documents in collection that matched.
 * @return {number} queryInfo.limit - Limit that was used.
 * @return {number} queryInfo.skip - Skip that was used.
 */
GET api/rounds
```
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

---
GET users/

POST users/

PUT users/

DELETE users/

---
GET users/:id/

POST users/:id/

PUT users/:id/

DELETE users/:id/

---
GET activities/

POST activities/

PUT activities/

DELETE activities/

---

GET activities/:id/

POST activities/:id/

PUT activities/:id/

DELETE activities/:id/

---
GET faq/

POST faq/

PUT faq/

DELETE faq/

---

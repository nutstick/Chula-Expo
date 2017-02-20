# API Helper

## Header Authorization

การรีเควส API โดยบางอันต้องการ Token เพื่อทำการระบุตัวตน ex. `/me`, `/activities/:aid/round/:rid/reserve` *ควรจะส่ง Token มาด้วยทุกครั้ง เผื่อเอา Data ไป analyse ต่อ*

โดยให้ทำการแนบ token ใส่ header ของ request ตาม format ข้างล่าง 
(JSON_WEB_TOKEN_STRING = token ที่ได้ตอน login, signup)
```
{
  ...
  Authorization: JWT JSON_WEB_TOKEN_STRING
  ...
}
```

## API query details

### Field

ใช้กำหนดว่าต้องการข้อมูลอะไรบ้างใน request นั้น เช่น `/api/activities` สำหรับหน้า
แรกที่ต้องการแค่ `ชื่อ(nameTH),รูป(thumbnail),เวลาเริ่ม(start),เวลาจบ(end)` สามารถใช้ field ในการรับข้อมูลแค่บางส่วนได้

โดยใช้ format คือ ชื่อ fields แต่ละอันขั้นด้วย `,` เช่น
<pre>
  <code>
  <i style="color: #6cdfea">request_url</i>?fields=nameTH,thumbnail,start,end
  </code>
</pre>

### Sort

ใช้สำหรับ request ที่ได้ data กลับมาเป็น list เราสามารถสั่งให้ sort dataด้วย fields นั้นๆได้
ด้วย sort เช่น `/api/activities` เราต้องการ

<pre>
  <code>
  [ascending order]
  <i style="color: #6cdfea">request_url</i>?sort=start
  [descending order]
  <i style="color: #6cdfea">request_url</i>?sort=-start
  [กรณี sort หลาย fields]
  <i style="color: #6cdfea">request_url</i>?sort=start,-createAt
  </code>
</pre>

### Limit, Skip

ใช้สำหรับการทำ pagination

limit หมายถึง จำนวน items ต้องการจาก request

skip หมายถึง ต้องการเริ่ม items จากตัวที่เท่าไร

เช่นถ้า page หนึ่งจะแสดงข้อมูล 5 activities แต่ตอนนี้ เราโชว์ page ที่ 3 
แสดงว่า เราต้องการข้อมูลตัวที่ `10-14`(5 ตัว) (หน้าที่หนึ่ง `0-4`, หน้าที่สอง `5-9`)ก็ต้องส่ง request ว่า
<pre>
  <code>
    <i style="color: #6cdfea">request_url</i>?limit=5&skip=10
  </code>
</pre>
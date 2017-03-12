#A2: API Documentations
##Pictures API
###Upload a picture
- description: upload an image
- request `POST /api/upload/`
  - content-type: `form-data`
  - body: object
    - title: (string) the tile of the image
    - author: (string) the author of the image
    - upload: (string) the type of upload either file or url
    - picture: (file) set iff upload = file.
    - url: string the image url, set iff upload = url
- response: 200
  - content-type: ``application/json``
  - body: object
    - status: (int) status code
    - id: (string) the ID of the image that you just added

```
$ curl -X POST
  -F title=title -F upload=url -F author=author -F url=url localhost:3000/api/upload/

$ curl -X POST
  -F title=title -F upload=file -F author=author -F picture=@localfilename localhost:3000/api/upload/
```

###Getting a picture/image
- description: retrieve a image; if /:id = first then gets first image, else must specify an image id
- request: `GET /api/image/:id`
- response: 200
  - content: `application/json`
  - body: list of objects
    - status: (int) repsonse
    - raw: object (contains image data)
      - title: (string) image title
      - author: (string) image author
      - type: (string) image type (url or file)
      - source: (string) location of image, if type = url then its a url if type = file then its the file name accessable at localhost:3000/source
      - \_id: the image id
      - createdAt: when the image was made
      - upadatedAt: when the image was last updated
```
$ curl http://localhost:3000/api/image/first
```

###Getting the next image
- description: given an image id get 'next' image. This is for the next image button on the front-end and behaves as one expects it to (i.e. A1 specs).
- request: `GET /api/next/:id`
- response: 200
  - content-type: `application/json`
  - body: list of objects
    - status: (int) status
    - raw: object (contains image data)
      - title: (string) image title
      - author: (string) image author
      - type: (string) image type (url or file)
      - source: (string) location of image, if type = url then its a url if type = file then its the file name accessable at localhost:3000/source
      - \_id: the image id
      - createdAt: when the image was made
      - upadatedAt: when the image was last updated
```
$ curl http://localhost:3000/api/next/TpDXlZpFPlyxKN8N

** where TpDXlZpFPlyxKN8N is an arbitrary img id **
```

###Getting the previous image
- description: given an image id get 'previous' image. This is for the previous image button on the front-end and behaves as one expects it to (i.e. A1 specs).
- request: `GET /api/prev/:id`
- response: 200
  - content-type: `application/json`
  - body: list of objects
    - status: (int) status
    - raw: object (contains image data)
      - title: (string) image title
      - author: (string) image author
      - type: (string) image type (url or file)
      - source: (string) location of image, if type = url then its a url if type = file then its the file name accessable at localhost:3000/source
      - \_id: the image id
      - createdAt: when the image was made
      - upadatedAt: when the image was last updated
```
$ curl http://localhost:3000/api/next/TpDXlZpFPlyxKN8N

** where TpDXlZpFPlyxKN8N is an arbitrary img id **
```

###Deleting an image
- description: remove an image given its id
- request: `DELETE /api/image/`
  - content-type: `application/json`
  - body: object
    - imgid: (string) the id of image you want to delete
- response: 200
  - status: (int) status
```
$ curl -X DELETE
       -H "Content-Type: `application/json`"
       -d '{"imgid":"sampleimgid"}'
       http://localhsot:3000/api/messages/
```

##Comments API
###Adding/Creating A Comment
- description: create a comment, recommend test using form on front-end
- request `POST /api/addcomment/`
  - content-type: `application/json`
  - body: object
    - imgid: (string) the id of image associated with comment
    - html: the html content of the comment
- response: 200
  - content-type: `application/json`
  - body: object
    - status: (int) status code
    - id: (string) comment id
```
$curl -H "Content-Type: application/json"
  -X POST
  -d '{"imgid":"xyz","html":"xyz"}'
  http://localhost:3000/api/addcomment/
```

###Getting Comments
- description get the next (start_index + 10) comments for image with a given imgid
- request: `GET /api/comments/:imgid/:start_index`
- response: 200
  - content-type: `application/json`
  - body: object
    - status: (int) status code
    - comments: (list) of comment objects
      - imgid: id of the image comment belongs to
      - html: the html content of comment
      - \_id: the comment id
      - createdAt: when comment was made
      - updatedAt: when comment was last updated

```
$curl http://localhost:3000/api/comments/xyz/0
```

###Deleting a Comment
- description: remove comment given its imgid and html content, recommend testing using front-end (make a comment then press x to delete - it makes a call straight to this method). Moreover, for whatever reason curl commands act weird with passing body to DELETE.
- request: `DELETE /api/comment/`
  - content-type: `application/json`
  - body: object
    - imgid: (string) the id of image you want to delete
    - html: (string) the html content of comment
- response: 200
  - status: (int) status
```
$ curl -X DELETE
       -H "Content-Type: `application/json`"
       -d '{"imgid":"sampleimgid", "html":"html"}'
       http://localhost:3000/api/messages/
```

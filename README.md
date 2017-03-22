this is a simple web gallery app made with node.js and vanilla html/css/js for a CSCC09 at utsc. this was publically uploaded to github
**after** assignments were marked. usage of materials in this repo are under the MIT license.

## Running the App
run the commands below and go to [https://localhost:3000](https://localhost:3000 in) your browser. (there is no http route)
```
cd app
npm install
node app.js
```

# API Documentation
# #Users API
### Registering A New User
- description: register a new user
- request: `PUT /api/users/`
  - content-type: `application/json`
  - body: object
    - username: (string) the username
    - password: (string) the password
- response: 200 | 500 if server error | 409 if user already exists
  - content-type: `application/json`
  - body: object
    - username: the username of new user

```
curl -X PUT -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H "Postman-Token: 1c19fbae-267c-ddfe-6076-c7755ab01356" -d '{
	"username": "test",
	"password": "test"
}' "https://localhost:3000/api/users"
```

### Logging In
- description: register a new user
- request: `POST /api/signin/`
  - content-type: `application/json`
  - body: object
    - username: (string) the username
    - password: (string) the password
- response: 200 | 500 if server error | 401 if Unauthorized | 400 if bad req.
  - content-type: `application/json`
  - body: object
    - status: (int) the status
    - username: (string) the username of user

```
curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -H "Postman-Token: b7a19d58-4e32-026c-8f7a-61a4f9e67e45" -d '{
	"username": "test",
	"password": "test"
}' "https://localhost:3000/api/signin/"
```

### Signing Out
- description: signs out a user
- request `GET /api/signout/`
- response: 200 | 500 if error
  - redirects to login page

```
curl -X GET -H "Cache-Control: no-cache" -H "Postman-Token: ba2b719a-b3ca-7167-9aa7-c9e449dbf9fe" "https://localhost:3000/api/signout/"
```

## Gallery API
### Getting A Paginated List of Galleries
- description: gets a paginated list of gallery's where (start_index)/10 + 1 = page #
- request: `GET /api/galleries/:start_index`
- response: 200 | 403 if Unauthorized
  - content-type: `application/json`
  - body: object
    - status: (int)
    - galleries: (json) relevent gallery objects || (string) nogalleries, if none found
```
curl -X GET -H "Cache-Control: no-cache" -H "Postman-Token: d1053c47-3497-4904-a0b4-1c84a6dd2f6d" "https://localhost:3000/api/galleries/0"
```


### Creating a Gallery (DEPRICATED)
- description: register a new user | this is unused, but still useful for testing
- request: `POST /api/gallery/`
  - content-type: `application/json`
  - body: object
    - username: (string) the username
    - galleryname: (string) the name of gallery
- response: 200 | 500 if server error | 403 if Unauthorized
  - content-type: `application/json`
  - body: object
    - status: (int) the status
    - id: (string) the gallery id

```
curl -X POST -H "Content-Type: application/javascript" -H "Cache-Control: no-cache" -H "Postman-Token: b3135819-6c15-7863-43cc-019bcb78acc7" -d '{
	"username": "test",
	"password": "test"
}' "https://localhost:3000/api/gallery/"
```

## Pictures API
### Upload a picture
- description: upload an image
- request `POST /api/upload/`
  - content-type: `form-data`
  - body: object
    - title: (string) the tile of the image
    - author: (string) the author of the image
    - upload: (string) the type of upload either file or url
    - picture: (file) set iff upload = file.
    - url: string the image url, set iff upload = url
- response: 200 || 403 if Unauthorized
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

### Getting a picture/image
- description: retrieve a image; if /:id = first then gets first image, else must specify an image id
- request: `GET /api/image/:gallery/:id`
- response: 200 || 403 if Unauthorized
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
$ curl http://localhost:3000/api/x/image/first
where x is the username of the user who's gallery you want to access
```

### Getting the next image
- description: given an image id get 'next' image. This is for the next image button on the front-end and behaves as one expects it to (i.e. A1 specs).
- request: `GET /api/next/:gallery/:id`
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
$ curl http://localhost:3000/api/next/x/TpDXlZpFPlyxKN8N

** where TpDXlZpFPlyxKN8N is an arbitrary img id **
where x is the username of the user who's gallery you want to access
```

### Getting the previous image
- description: given an image id get 'previous' image. This is for the previous image button on the front-end and behaves as one expects it to (i.e. A1 specs).
- request: `GET /api/prev/:gallery/:id`
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
$ curl http://localhost:3000/api/next/x/TpDXlZpFPlyxKN8N

** where TpDXlZpFPlyxKN8N is an arbitrary img id **
where x is the username of the user who's gallery you want to access
```

### Deleting an image
- description: remove an image given its id
- request: `DELETE /api/image/:gallery/:image`
- response: 200 || 403 if Unauthorized
  - status: (int) status
```
$ curl http://localhost:3000/api/next/x/TpDXlZpFPlyxKN8N
** where TpDXlZpFPlyxKN8N is an arbitrary img id **
where x is the username of the user who's gallery you want to access
```

## Comments API
### Adding/Creating A Comment
- description: create a comment, recommend test using form on front-end
- request `POST /api/addcomment/`
  - content-type: `application/json`
  - body: object
    - imgid: (string) the id of image associated with comment
    - name: (string) the name of posting user
    - content: (string) the comment content
    - timestamp: (string) when the comment was created
- response: 200 || 403 if Unauthorized
  - content-type: `application/json`
  - body: object
    - status: (int) status code
    - id: (string) comment id
```
$curl -H "Content-Type: application/json"
  -X POST
  -d '{"imgid":"xyz","name":"xyz", "content":"zyx", "timestamp":"timestamp"}'
  http://localhost:3000/api/addcomment/
```

### Getting Comments
- description get the next (start_index + 10) comments for image with a given imgid
- request: `GET /api/comments/:imgid/:start_index`
- response: 200 || 403 if Unauthorized
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

### Deleting a Comment
- description: remove comment given its imgid and html content, recommend testing using front-end (make a comment then press x to delete - it makes a call straight to this method). Moreover, for whatever reason curl commands act weird with passing body to DELETE.
- request: `DELETE /api/comment/:id/:owner`
  - content-type: `params`
  - id: (string) the id of the comment to delete
  - owner: (string) true if the requesting user is the OP of comment false o/w
- response: 200 || 403 if Unauthorized
  - body: object
    - numRemoved: (string) number of items removed (1 or 0)
```
$ curl http://localhost:3000/api/next/TpDXlZpFPlyxKN8N/true
where TpDXlZpFPlyxKN8N is an arbitrary comment id
```

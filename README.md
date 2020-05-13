# Airspace Link | Steven Olthoff

![](images/example.png)

## Run the project

### Start the Back-End

1. Clone the [back-end](https://github.com/stevenwilliamolthoff/airspace-backend).

2. `cd airspace-backend`

3. `docker-compose up`

### Start the Front-End

1. Clone the front-end (this repo).

2. `cd airspace`

3. `npm i`

4. `npm run start`

5. Open `localhost:3000`

## Approach

### The Dashboard

#### Layout

Upon loading the dashboard, a familiar layout will appear: On the left is a list of flight operations. To the right is a map centered on the Detroit airport. Controlled airspace is drawn in a light red.

#### Create an Operation

To create a new operation, click the button labelled "New Operation". A panel on the right will open. Here, you can view and edit the title and times of the operation. To begin editing a field, click it. Edits are automatically saved.

To begin drawing the shapes for a flight, click on the drawing buttons. These buttons appear near the top-left edge of the right panel. If a drawn shape intersects with controlled airspace, the intersection is displayed in a bright red. Contiguous intersections are automatically merged.

After drawing flight shapes, a message will be displayed at the top of the map indicating whether the flight will be accepted or rejected, along with the number of square miles of intersection with controlled airspace.

#### Edit an Operation

To view an existing operation, click on an item in the operations list. From here, you can edit the operation in the same way as before.

### Approaching the Dashboard Layout

Separating components is of course a very important part of writing React. Some say that component reusability is the main benefit, but in my opinion, plain readability is an even bigger benefit. I laid out my component files to roughly reflect their layout in the DOM.

```
- Operations
  - InfoPanel
  - List
  - Map
    - Message
```

If I were to continue working on this project, I would write generic components. List items, modals, buttons, etc. should all be written generically. I would also more heavily rely on CSS variables for consistent styling (I began to do this in `constants.scss`).

I am coming from a Vue background, so I was studying React as I worked on this project. Had I more time, I would have used React hooks. This time around, I used class components so that I could start working immediately.

### Model

There is a single data model: operations. An operation is a plan for a flight. The properties of an operation include a title, GeoJson, and start and end times. These properties can be found in the table mapping in `airspace-backend/src/entities/Operations.ts`.

### The API

In terms of code, my approach simply prioritizes the ease of writing and using a RESTful API. I take full advantage of typed interfaces so very little code is needed. I am using TypeORM, which is a great TypeScript ORM. Operations are handled by a routes file (`src/routes/operations.ts`) and a model file (`src/entities/Operations.ts`). This code is nearly all boilerplate.

There are four endpoints, each of which do exactly what is expected:

```
GET  operations     - Called when the dashboard loads
GET  operations/:id - Called when an operation loads
PUT  operations     - Called when an operation is created
POST operations/:id - Called when an operation is updated
```

## Ideas

- Handle arbitrary number of controlled airspace areas
- View other scheduled flights in the Airspace Link system
- Map overlay: residential zones
- Ability to scroll through time to see how zones on the map change throughout the day
- User inputs destinations and a route is suggested
- Show land elevation

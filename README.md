# Standard Action Generator

A configuration based a configuration based Action Creator & Type constant generator

## Purpose

React has the problem of being often accompanied by large amounts of boilerplate; most of it is due to contant and actions creators. Although most actions creators have little or no logic; the lack of consisten naming & arguments makes is extremely annoying to track and manage. Some solutions exist they do not provide a consistent, simple and expressive way of access action creators, its type constants.

This packages offer a solution to the boilerplate issues by standardizing actions creators and types generators in both its creations and functionalities, arguments and access. The configurations system is designed to be flexible and expressive and highly configurable while allowing quick and simple access to to actions creators and types. standardization of actions is reached by extending (https://github.com/acdlite/flux-standard-action)[Flux Standard Action Convention] as to define the shape of the Type constant with information of the type of data (*Resource*) currently being handled, the purpose of the current action (*Functionality*) and, for async requests (*the status of the request*)

## Installation

```
npm install standard-action-generator --save
```
or
```
yarn add standard-action-generator
```

### Conventions

According to Flux Standard Action Convention all actions must contain 3 properties: a payload, type, error & meta property. We extend the convention by specifying the contents of the meta key & defining the shape of the type constant as follows:

```jsx
{
    payload: Any,
    type: ${resource1}_${resource2}_...${resourceN}_${functionality}(_${status}),
    error: Any,
    meta: {
        resources: [String],
        functionality: String,
        status: String,
    }
}
```

### Definitions

* Resources: are the data structures being handled. Standard Action Factory is built to handle nested resources; thus, in the meta tag; the resource value is an array of strings.
* Functionality: describe the purpose of the action triggered. By default all Action Creators generated will have the Standard CRUD actions defined upon them: ```create```, ```delete```, ```update``` and ```load```)
* Status: describe the status of the current request. By default we support 4 statuses:  ```request```, ```requested```, ```responded```, ```succeeded```and ```failed```

### Type Structure

The TYPE constant structure is defined by joining the resources, in the user defined order, with the functionality and, optionally status of the request. Just as its common convention the TYPE constant generated is build as an all caps camel case string.


### Usage

The main purpose of the library is to create a simple, reliable and expressive way of access actions. Lest assume you have already generated you action creators and exported them from 'resources/actions' or any other location within you app. You can then use your actions ass:

#### Get the TYPE constant

```jsx
import actions from 'resources/actions';

actions.user.books.load.succeeded.type

// which returns
'USER_BOOKS_LOAD_SUCCEEDED'

```

#### Get the Action Creator constant

For Example if I wanted to get the full action creator object you should call

```js
actions.user.books.delete.failed.creator(
    'myPayload',
    {error1: 'this is the error object'},
    {m1: 'someExtraMetaInfo'}
)

// which returns
{
    payload: 'myPayload',
    type: USER_BOOKS_DELETE_SUCCEEDED,
    error: {error1: 'this is the error object'},
    meta: {
        resources: ['user', 'books'],
        functionality: 'delete',
        status: 'failed',
        m1: 'someExtraMetaInfo',
    },
}

```

#### Dispatch without connect

This module also includes support for direct action dispatching in the followin way.

```js
actions.user.books.delete.failed.dispatch(
    'myPayload',
    {error1: 'this is the error object'},
    {m1: 'someExtraMetaInfo'}
)
```

The example will dispatch the action object defined in the previous example to the store.

### Configuration

this is an example of configuration object.

``` js
import store from 'wherever you generated the store'
import buildActionTree from 'standard-action-generator'


const allowedResources = [
    {
        name: 'users',
        functionalities: [ 'add', 'remove' ],
        states: [],
    },
    {
        name: 'ideas',
    },
    {
        name: 'drafts',
        sub: [
            {
                name: 'priceRequests',
                functionalities: [ 'add', 'remove' ],
            },
        ],
        functionalities: [ 'add', 'remove' ],
        states: [ 'banana' ],
    },
    {
        name: 'redux',
        functionalities: [],
        actionCreators: {
            undo: args => ({ type: 'undo', num: args }),
            do: args => ({ type: 'redo', num: args }),
        },
    },
]

const actions = buildActionTree(allowedResources, store)

```

This configurations will generate the following actions

```js
actions.users.add
actions.users.remove

actions.ideas.create
actions.ideas.create.request
actions.ideas.create.requested
actions.ideas.create.responded
actions.ideas.create.succeeded
actions.ideas.create.failed

actions.ideas.update
actions.ideas.update.request
actions.ideas.update.requested
actions.ideas.update.responded
actions.ideas.update.succeeded
actions.ideas.update.failed

actions.ideas.load
actions.ideas.load.request
actions.ideas.load.requested
actions.ideas.load.responded
actions.ideas.load.succeeded
actions.ideas.load.failed

actions.ideas.delete
actions.ideas.delete.request
actions.ideas.delete.requested
actions.ideas.delete.responded
actions.ideas.delete.succeeded
actions.ideas.delete.failed

actions.drafts.add
actions.drafts.add.banana
actions.drafts.remove
actions.drafts.remove.banana

actions.drafts.pricerequests.add
actions.drafts.pricerequests.add.request
actions.drafts.pricerequests.add.requested
actions.drafts.pricerequests.add.responded
actions.drafts.pricerequests.add.succeeded
actions.drafts.pricerequests.add.failed
actions.drafts.pricerequests.remove
actions.drafts.pricerequests.remove.request
actions.drafts.pricerequests.remove.requested
actions.drafts.pricerequests.remove.responded
actions.drafts.pricerequests.remove.succeeded
actions.drafts.pricerequests.remove.failed

actions.drafts.leads.add
actions.drafts.leads.add.request
actions.drafts.leads.add.requested
actions.drafts.leads.add.responded
actions.drafts.leads.add.succeeded
actions.drafts.leads.add.failed
actions.drafts.leads.remove
actions.drafts.leads.remove.request
actions.drafts.leads.remove.requested
actions.drafts.leads.remove.responded
actions.drafts.leads.remove.succeeded
actions.drafts.leads.remove.failed

actions.locations.visit
actions.locations.visit.now
actions.locations.leave

actions.redux.undo
actions.redux.do
```

#### Considerations

* As a rule by default stateless actions will always be created
* functionality key needs to be an Array or an object; if an object is used the functionality will be give by each key and the statuses will be defined by the values given
* Statuses must always be an array
* custom action creators can still be passed
* If no statuses of functionalities are given; the generator will use the defaults.

### Generating actions

Actions are generated with the ```buildActionTree``` method. which accepts the following arguments

```js
buildActionTree(configuration[, store])
```

### Setting Up defaults

Since you might want to use different defaults from the one we defined we expose the following method ```setDefaultFunctionalitiesAndStatuses```

```js

import { setDefaultFunctionalitiesAndStatuses } from 'standard-action-generator'
import { store } from './store'

setDefaultFunctionalitiesAndStatuses(['f1', 'f2'], ['s1', 's2'])
const actions = buildActionTree({ name: 'user' }, store)

// allows us to call the following actions
actions.user.f1
actions.user.f1.s1
actions.user.f1.s2

actions.user.f2
actions.user.f2.s1
actions.user.f2.s2
```

*Note:* if you want to change your defaults again you should call the setDefaultFunctionalitiesAndStatuses again.

### Using the types for the reducers

If you now want to use the TYPEs you generated in your reducers you will have a pesky circular dependency problem. There are in fact 2 solutions

1. Inject the reducers into the store after the store has been initialized
2. use the makeDispatchable method we provide

```js
import {setDefaultFunctionalitiesAndStatuses, makeDispatchable} from 'standard-action-generator'
import {store} from './store'

const actions = buildActionTree({ name: 'user' })

actions.user.create.dispatch() // returns null

makeDispatchable(actions)

actions.user.create.dispatch() // will dispatch the action to the store

```

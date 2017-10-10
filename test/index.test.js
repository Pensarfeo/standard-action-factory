import buildActionTree, {
    StandardAction,
    DEFATUL_FUNCTIONALITIES,
    DEFATUL_STATES,
    setDefaultFunctionalitiesAndStates } from '../src'

const tempStore = []
const store = { dispatch: args => tempStore.push(args) }

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
        sub: [ {
            name: 'priceRequests',
            functionalities: [ 'add', 'remove' ],
        },
        {
            name: 'leads',
            functionalities: [ 'add', 'remove' ],
        },
        ],
        functionalities: [ 'add', 'remove' ],
        states: [ 'banana' ],
    },
    {
        name: 'locations',
        functionalities: { visit: [ 'now' ], leave: [] },
        sub: [ {
            name: 'restaurants',
            sub: [
                { name: 'chairs' },
            ],
        } ],
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
const statelessSAKeys = [ 'meta', 'type', '__store__' ]

describe('action object was created and', () => {
    it('it should be an object', () => {
        expect(typeof actions).toEqual('object')
    })

    it('it should should have a key "users" with value of type Object', () => {
        expect(typeof actions.users).toEqual('object')
    })

    it('it should should have keys users, ideas, drafts, locations and redux all of type Object', () => {
        expect(typeof actions.users).toEqual('object')
        expect(typeof actions.ideas).toEqual('object')
        expect(typeof actions.drafts).toEqual('object')
        expect(typeof actions.locations).toEqual('object')
        expect(typeof actions.redux).toEqual('object')
    })
})

describe('for an array of functionalityes and empty array of states (action.users)', () => {
    it('it should have only 2 properties add & remove', () => {
        expect(Object.keys(actions.users)).toEqual([ 'add', 'remove' ])
    })

    it('it should have values of type StandardAction', () => {
        expect(actions.users.add).toBeInstanceOf(StandardAction)
        expect(actions.users.remove).toBeInstanceOf(StandardAction)
    })

    it('it should not have any state keys attached', () => {
        expect(Object.keys(actions.users.add)).toEqual(statelessSAKeys)
        expect(Object.keys(actions.users.add)).toEqual(statelessSAKeys)
    })
})

describe('for an empty array of functionalityes and empty array of states (action.ideas)', () => {
    it('it should have all default functionalities', () => {
        expect(Object.keys(actions.ideas)).toEqual(DEFATUL_FUNCTIONALITIES)
    })

    it('it should have values of type StandardAction', () => {
        DEFATUL_FUNCTIONALITIES.forEach((func) => {
            expect(actions.ideas[ func ]).toBeInstanceOf(StandardAction)
        })
    })

    it('for each functionality it should have all defaut states', () => {
        const expectedKeys = statelessSAKeys.concat(DEFATUL_STATES)
        DEFATUL_FUNCTIONALITIES.forEach((func) => {
            expect(Object.keys(actions.ideas[ func ])).toEqual(expectedKeys)
        })
    })

    it('for each functionality all states should be instances of StandardAction', () => {
        DEFATUL_FUNCTIONALITIES.forEach((func) => {
            DEFATUL_STATES.forEach((state) => {
                expect(actions.ideas[ func ][ state ]).toBeInstanceOf(StandardAction)
            })
        })
    })
})

describe('for a given array of sub resources (action.drafts)', () => {
    it('it should have all sub resource objects', () => {
        [ 'priceRequests', 'leads' ].forEach((res) => {
            expect(actions.drafts[ res ].add[ DEFATUL_STATES[ 0 ] ]).toBeInstanceOf(StandardAction)
        })
    })
})

describe('for a given array of sub nexted resources (action.locations)', () => {
    it('it should have all sub resource objects', () => {
        expect(actions
            .locations
            .restaurants
            .chairs[ DEFATUL_FUNCTIONALITIES[ 0 ] ][ DEFATUL_STATES[ 0 ] ])
            .toBeInstanceOf(StandardAction)
    })
})

//         functionalities: { visit: [ 'now' ], leave: [] }

describe('for a given object functionalities (action.locations)', () => {
    it('the functionalities should be the keys of the objects', () => {
        const loctFunObje = { visit: [ 'now' ], leave: [] }
        expect(Object.keys(actions.locations)).toEqual([ 'visit', 'leave', 'restaurants' ]);
        [ 'visit', 'leave' ].forEach((fun) => {
            expect(Object.keys(actions.locations[ fun ])).toEqual(statelessSAKeys.concat(loctFunObje[ fun ]))
        })
    })
})

// actionCreators: {
//     undo: args => ({ type: 'undo', num: args }),
//     do: args => ({ type: 'redo', num: args }),
// },

describe('for a given object actionCreators (action.redux)', () => {
    it('the keys of the action creator object should become functionalities', () => {
        expect(Object.keys(actions.redux)).toEqual([ 'undo', 'do' ])
    })
    it('the create method of the standard action should be the given function', () => {
        expect(actions.redux.undo.creator(12)).toEqual({ type: 'undo', num: 12 })
        expect(actions.redux.do.creator(234512)).toEqual({ type: 'redo', num: 234512 })
    })
})

const actionObj1 = {
    error: {
        ugly: 2,
    },
    meta: {
        fork: 'dirty',
        functionality: 'create',
        resources: [
            'locations',
            'restaurants',
        ],
        state: 'toRequest',
    },
    payload: {
        banana: 1,
    },
    type: 'LOCATIONS_RESTAURANTS_CREATE_TOREQUEST',
}

const actionObj2 = {
    error: {},
    meta: {
        functionality: 'create',
        resources: [
            'locations',
            'restaurants',
        ],
        state: 'toRequest',
    },
    payload: {
        banana: 2,
    },
    type: 'LOCATIONS_RESTAURANTS_CREATE_TOREQUEST',
}

describe('it should be able to dispatch the functions to the store directly', () => {
    it('and generate the righ types and metas', () => {
        const state = DEFATUL_STATES[ 0 ]
        const functionality = DEFATUL_FUNCTIONALITIES[ 0 ]
        actions.locations.restaurants[ functionality ][ state ].dispatch({ banana: 1 }, { ugly: 2 }, { fork: 'dirty' })
        expect(tempStore[ 0 ]).toEqual(actionObj1)
    })

    it('and generate the righ types and metas with no error or meta given', () => {
        const state = DEFATUL_STATES[ 0 ]
        const functionality = DEFATUL_FUNCTIONALITIES[ 0 ]
        actions.locations.restaurants[ functionality ][ state ].dispatch({ banana: 2 })
        expect(tempStore[ 1 ]).toEqual(actionObj2)
    })
})

// setDefaultFunctionalitiesAndStates

describe('for the module', () => {
    it('we should be able to set default states and functionalities', () => {
        const newDefFunct = [ 'a', 'b' ]
        const newDefState = [ 'c', 'd' ]
        setDefaultFunctionalitiesAndStates(newDefFunct, newDefState)
        const newActions = buildActionTree([ { name: 'banana' } ])
        newDefFunct.forEach((func) => {
            newDefState.forEach((state) => {
                expect(newActions.banana[ func ][ state ]).toBeInstanceOf(StandardAction)
            })
        })
    })

    it('we should be able attach new functionalities to a previously creates', () => {
        const newDefFunct = [ 'a', 'b' ]
        const newDefState = [ 'c', 'd' ]
        setDefaultFunctionalitiesAndStates(newDefFunct, newDefState)
        const prevActions = Object.assign({}, actions)
        buildActionTree([ { name: 'banana' } ], null, actions)
        newDefFunct.forEach((func) => {
            newDefState.forEach((state) => {
                expect(actions.banana[ func ][ state ]).toBeInstanceOf(StandardAction)
            })
        })
        Object.keys(prevActions).forEach((res) => {
            expect(actions[ res ] === prevActions[ res ]).toBeTruthy()
        })
    })
})

describe('StandardAction', () => {
    it('it should be able to return the trace of resource', () => {
        const obj1 = {}
        const obj2 = { parent: obj1, name: 'banana' }
        const obj3 = { parent: obj2, name: 'monkey' }

        expect(StandardAction.getTrace(obj3)).toEqual([ 'banana', 'monkey' ])
    })
    it('it should be able to generate a type from the meta', () => {
        expect(StandardAction.generateType({
            resources: [ 'asdf', 'asdf' ],
            functionality: 'wer',
            state: '3423',
        })).toEqual('ASDF_ASDF_WER_3423')
    })
})

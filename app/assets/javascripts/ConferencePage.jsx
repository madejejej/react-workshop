const {
    Promise,
    React: { Component },
    ReactBootstrap: { Button },
    ReactDOM,
    ReactRedux,
    Redux,
    ReduxThunk,
    PanelWithButton
} = window;

function ConferencePage() {
    const getConferenceId = () => {
        let splitPathname = window.location.pathname.split("/")

        return splitPathname[splitPathname.length - 1]
    }

    const initialState = () => {
        return {
            loaded: false,
            id: getConferenceId(),
            conference: {},
            days: [],
            events: []
        }
    };

    const landingReducer = (state = initialState(), action) => {
        console.log(action.type)
        switch (action.type) {
            case 'LOAD':
                return {
                    ...state,
                    loading: true
                }
            case 'LOAD_SUCCESS':
                return {
                    ...state,
                    loading: false,
                    loaded: true,
                    conference: action.conference
                }
            case 'RELATIONS_LOADED':
                console.log(action)
                return {
                    ...state,
                    days: action.days,
                    events: action.events
                }
            default:
                return state;
        }
    };

    const store = Redux.applyMiddleware(
        ReduxThunk.default,
    )(Redux.createStore)(landingReducer, initialState());

    const requestConferences = () => {
        return {
            type: 'LOAD'
        }
    }

    const conferenceLoaded = (conference) => {
        return {
            type: 'LOAD_SUCCESS',
            conference: conference
        }
    }

    const relationsLoaded = (days, events) => {
        return {
            type: 'RELATIONS_LOADED',
            days: days,
            events: events
        }
    }

    const fetchConference = (id) => {
        return (dispatch) => {
            dispatch(requestConferences())

            return APIClient
                .get(`/conferences/${id}.jsonapi`)
                .then((response) => response.json())
                .then((json) => {
                    dispatch(conferenceLoaded(json.data.attributes))

                    return Promise.all([
                        APIClient.get(json.links.days),
                        APIClient.get(json.links.events)
                    ])
                })
                .then((responses) => Promise.all([responses[0].json(), responses[1].json()]))
                .then((daysAndEvents) => {
                    let days = daysAndEvents[0]
                    let events = daysAndEvents[1]

                    let daysAttributes = days.data.map((day) => { return { id: day.id, ...day.attributes } })
                    let eventsAttributes = events.data.map((event) => { return { id: event.id, ...event.attributes } })

                    dispatch(relationsLoaded(daysAttributes, eventsAttributes))
                })

        }
    }

    const stateMapper = ({ conference, id, loading, loaded, events, days }) => { return { id, conference, loading, loaded, events, days }; }
    const dispatchMapper = (dispatch) => {
        return {
            mounting(id) {
                dispatch(fetchConference(id));
            }
        }
    };

    class ConferencePageComponent extends Component {
        componentWillMount() {
            this.props.mounting(this.props.id)
        }

        render() {
            if (this.props.loading) {
                return (
                    <span>Loading...</span>
                )
            }

            let conference = this.props.conference

            let events = this.props.events.map( (event) => (
                <li key={event.id} className="list-group-item">
                    <h4>{event.name} <br />
                        <small>By {event.host}</small></h4>
                    <h6>Description</h6>
                    <p>{event.description}</p>
                    <p><i>This event takes {event.time_in_minutes} minutes.</i></p>
                    <div className="alert alert-success">This event is scheduled for <strong>Day 1</strong> of the conference at 18:00 AM.</div>
                </li>
            ))

            let days = this.props.days.map( (day) => (
                <li key={day.id} className="list-group-item">
                    <h4>{day.label}</h4>
                    <p>This day begins on {new Date(day.from).toLocaleString()} and ends on {new Date(day.to).toLocaleString()}.</p>
                    <h5>Agenda <a href="/conference_days/day-1/conference_day_plan" className="btn btn-primary btn-xs">Manage</a></h5>
                    <ul>
                        <li><strong>13:00&ndash;14:00</strong> Working with Legacy Code</li>
                    </ul>
                </li>
            ))

            return (
                <div>
                    <div>
                        <h1>
                            <div className="pull-right">
                                <div className="btn-group">
                                    <a href="/conferences" className="btn btn-default">Back</a>
                                    <button className="btn btn-danger">Delete</button>
                                </div>
                            </div>
                            {conference.name}
                        </h1>
                    </div>
                    <div className="col-md-6">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h2 className="panel-title">
                                    <div className="pull-right">
                                        <a href="/conferences/active-conference/events" className="btn btn-primary btn-xs">Manage</a>
                                    </div>
                                    Events
                                </h2>
                            </div>
                            <div className="panel-body">
                                <ul className="list-group">
                                    {events}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="panel panel-default">
                            <div className="panel-heading">
                                <h2 className="panel-title">
                                    <div className="pull-right">
                                        <a href="/conferences/active-conference/conference_days" className="btn btn-primary btn-xs">Manage</a>
                                    </div>
                                    Days
                                </h2>
                            </div>
                            <div className="panel-body">
                                <ul className="list-group">
                                    {days}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )
        }
    }
    const connector = ReactRedux.connect(stateMapper, dispatchMapper);
    const ConnectedConferencePage = connector(ConferencePageComponent);

    return {
        ui () {
            return (
                <ReactRedux.Provider store={store}>
                    <ConnectedConferencePage />
                </ReactRedux.Provider>
            );
        }
    };
}

$(() => {
    const page = ConferencePage();
    // Provide a container where your application will get rendered.
    // Here we assume that there is a div with id "greeter":
    let elem = document.getElementById("conference")
    if (elem) {
        ReactDOM.render(page.ui(), elem);
    }
});

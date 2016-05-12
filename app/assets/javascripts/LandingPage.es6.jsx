const {
    APIClient,
    React: { Component },
    ReactBootstrap: { Button },
    ReactDOM,
    ReactRedux,
    Redux,
    ReduxThunk,
    PanelWithButton
} = window;

function LandingPage() {
    const initialState = () => {
        return {
            loaded: false,
            conferences: []
        }
    };

    const landingReducer = (state = initialState(), action) => {
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
                    conferences: action.data.map((d) => { return { id: d.id, name: d.attributes.name } })
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

    const conferencesLoaded = (data) => {
        return {
            type: 'LOAD_SUCCESS',
            data: data
        }
    }

    const fetchConferences = () => {
        return (dispatch) => {
            dispatch(requestConferences())

            return APIClient
                .get("/conferences.jsonapi")
                .then((response) => response.json())
                .then((json) => dispatch(conferencesLoaded(json.data)))
        }
    }

    const stateMapper = ({ conferences, loading, loaded }) => { return { conferences, loading, loaded }; }
    const dispatchMapper = (dispatch) => {
        return {
            mounting() {
                dispatch(fetchConferences());
            }
        }
    };

    class Landing extends Component {
        componentWillMount() {
            this.props.mounting()
        }
        
        render() {
            if (this.props.loading) {
                return (
                    <span>Loading...</span>
                )
            }

            let conferences = this.props.conferences
            
            return (
                <div>
                    {conferences.map((conference) => {
                        return (<PanelWithButton
                            key={conference.id}
                            header={conference.name}
                            button={<Button bsStyle="primary" bsSize="xs" href={`/conferences/${conference.id}`}>Show</Button>}
                        />)
                    })}
                </div>
            )
        }
    }
    const connector = ReactRedux.connect(stateMapper, dispatchMapper);
    const ConnectedLanding = connector(Landing);

    return {
        ui () {
            return (
                <ReactRedux.Provider store={store}>
                    <ConnectedLanding />
                </ReactRedux.Provider>
            );
        }
    };
}

$(() => {
    const landingPage = LandingPage();
    // Provide a container where your application will get rendered.
    // Here we assume that there is a div with id "greeter":
    let elem = document.getElementById("conferences");
    if (elem) {
        ReactDOM.render(landingPage.ui(), elem);
    }
});


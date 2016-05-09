const { React,
    ReactDOM,
    Redux,
    ReactRedux,
    PanelWithButton
    } = window;

function LandingPage() {
    const initialState = () => {
        return {
            conferences: [{id: "active-conference", name: "wroc_love.rb 2016"}, {id: "past-conference", name: "wroc_love.rb 2015"}]
        }
    };

    const update = (state = initialState(), action) => {
        switch (action.type) {
            default:
                return state;
        }
    };

    const store = Redux.createStore(update, initialState());

    const stateMapper = ({ conferences }) => { return { conferences }; }
    const dispatchMapper = (dispatch) => { return {} };

    const Landing = ({conferences}) => {
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
    ReactDOM.render(landingPage.ui(), document.getElementById("conferences"));
});


const PanelWithButton = ({header, button}) => {
    return (
        <div className="panel panel-default">
            <div className="panel-heading">
                <div className="pull-right">
                    {button}
                </div>
                <h3 className="panel-title">{header}</h3>
            </div>
        </div>
    )
}



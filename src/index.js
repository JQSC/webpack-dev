import React from 'react';
import ReactDOM from 'react-dom'
import { Button } from 'antd'
import './index.css'

function App() {
    return (
        <div>
            123
            <Button type={'primary'}>456</Button>
        </div>
    )
}

ReactDOM.render(
    <App />,
    document.getElementById('app')
);
import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom';
const Welcome = () => {
  const [show, setShow] = useState(true);
  const navigate = useNavigate();


    const accept = ()=>{
        setShow(false);
        navigate('/mainlayout');
       
    }
    const notaccepted = ()=>{
        window.location.href = 'https://www.google.com/' ;
    }

    return (
        <div>
            <Modal  
                centered 
                show={show} 
                onHide={() => setShow(false)}
                backdrop = 'static'
                keyboard = {false}
                >

                <Modal.Header className='justify-content-center' >
                    <Modal.Title className='text-center'><h2>Üdvözöljük Europe Ballistic weboldalán!</h2></Modal.Title>
                </Modal.Header>
                <Modal.Body className='text-center'>
                    <p>Felhasználás csak szakmai bla bla...</p>
                </Modal.Body>
                <Modal.Footer className='justify-content-center'>
                    <Button className='me-5'  variant="success" onClick={accept}>Elfogadom</Button>
                    <Button className='ms-5'  variant="danger" onClick={notaccepted}>Elutasít</Button>
                    
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Welcome
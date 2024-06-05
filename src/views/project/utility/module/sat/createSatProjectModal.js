import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Folder,
  Lock,
  Mail,
  Smartphone,
  User
} from 'react-feather';
import {
  Col,
  Form,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Label,
  Input,
  Button
} from 'reactstrap';
import Select from 'react-select';
import { selectThemeColors } from '@utils';
import jwt_decode from 'jwt-decode';
import useJwt from '@src/auth/jwt/useJwt';
import { toast } from 'react-toastify';
import Toast from '@src/views/ui-elements/cards/actions/createToast';
import authLogout from '../../../../../auth/jwt/logoutlogic';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

const CreateSatProjectModal = (props) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Logout User
  const [logout, setLogout] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();
  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout]);

  const postUploadFile = async (formData) => {
    setIsLoading(true);
    try {
      const res = await useJwt.postSATFile(formData);
      if (res.status === 201) {
        toast.success(<Toast msg={`${res.data.message}`} type="success" />, {
          hideProgressBar: true
        });
        props.setRetry(true);
        props.setCenteredModal(false);
      }
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setLogout(true);
      } else if (
        error?.response?.status === 400 ||
        error?.response?.status === 500
      ) {
        toast.error(
          <Toast msg={error?.response?.data?.error} type="danger" />,
          {
            hideProgressBar: true
          }
        );
      } else {
        toast.error(
          <Toast msg={'Something went wrong please retry .'} type="danger" />,
          {
            hideProgressBar: true
          }
        );
      }
    }
    setIsLoading(false);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    postUploadFile(formData);
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <FormGroup row>
          <Label sm="3" for="exampleCustomFileBrowser">
            Import SAT Data
          </Label>
          <Col sm="5" className="">
            <Input
              type="file"
              id="exampleCustomFileBrowser"
              name="customFile"
              accept=".csv"
              required
              onChange={handleFileChange}
            />
          </Col>
        </FormGroup>
        <FormGroup className="mb-0 " row>
          <Col sm="9" className="d-flex  " md={{ size: 9, offset: 3 }}>
            <Button.Ripple
              color="primary"
              type="submit"
              className="btn-next "
              disabled={isLoading}
            >
              <span className="align-middle">
                {isLoading ? 'Uploading...' : 'Upload'}
              </span>
            </Button.Ripple>
          </Col>
        </FormGroup>
      </Form>
    </>
  );
};

export default CreateSatProjectModal;

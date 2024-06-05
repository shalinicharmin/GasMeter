import {
  Button,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Spinner,
} from 'reactstrap';

import { useState, useEffect } from 'react';
import useJwt from '@src/auth/jwt/useJwt';
import { toast } from 'react-toastify';
import Loader from '@src/views/project/misc/loader';
import Toast from '@src/views/ui-elements/cards/actions/createToast';

import authLogout from '../../../../../auth/jwt/logoutlogic';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

const CopyTestConfig = (props) => {
  // console.log(props.testsRowsData)
  const [formData, setformData] = useState({
    passingCriteria: props.testsRowsData.passingCriteria,
    expResTime: props.testsRowsData.expResTime,
    id: props.testsRowsData.id,
  });

  // console.log(formData)
  const [isLoading, setIsLoading] = useState(false);
  const [logout, setLogout] = useState(false);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    if (logout) {
      authLogout(history, dispatch);
    }
  }, [logout, props.rowData.id]);

  const handlechange = (event) => {
    const name = event.target.name;
    const value = event.target.value.replace(/[^0-9]/g, '');
    setformData((values) => ({ ...values, [name]: value }));
  };

  const onHandleSubmit = async (e) => {
    e.preventDefault();
    if (!(formData.passingCriteria >= 1 && formData.passingCriteria <= 100)) {
      toast.error(
        <Toast
          msg={'Passing Criteria must be between 1 to 100'}
          type="danger"
        />,
        {
          hideProgressBar: true,
        }
      );
      return false;
    } else {
      setIsLoading(true);
      if (!formData.sampleCount) {
        formData.sampleCount = props.rowData?.meters?.length;
      }
      try {
        const res = await useJwt.copyTest(formData);
        if (res.status === 201) {
          toast.success(<Toast msg={res.data?.message} type="success" />, {
            hideProgressBar: true,
          });
          props.setRetry(true);
          props.updatedTestConfigModal(false);
        }
      } catch (error) {
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403
        ) {
          setLogout(true);
        } else if (
          error?.response?.status === 400 ||
          error?.response?.status === 500
        ) {
          toast.error(<Toast msg={error.response.data.error} type="danger" />, {
            hideProgressBar: true,
          });
        } else {
          toast.error(
            <Toast msg={'Something went wrong please retry .'} type="danger" />,
            {
              hideProgressBar: true,
            }
          );
        }
      }

      setIsLoading(false);
    }
  };

  return (
    <>
      <Form onSubmit={onHandleSubmit}>
        <FormGroup row>
          <Label sm="3" for="passing_criteria">
            Passing Criteria (%)
          </Label>
          <Col sm="8" className="">
            <Input
              type="text"
              value={formData.passingCriteria}
              onChange={handlechange}
              id="passing_criteria"
              name="passingCriteria"
              placeholder="90"
              required
            />
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label sm="3" for="reply_time">
            Exp. Res Time (sec)
          </Label>
          <Col sm="8" className="">
            <Input
              type="text"
              id="reply_time"
              value={formData.expResTime}
              onChange={handlechange}
              name="expResTime"
              placeholder="3"
              required
            />
          </Col>
        </FormGroup>

        <FormGroup row>
          <Label sm="3" for="Sample_size">
            Sample Size ( Max : {props.rowData?.meters?.length} )
          </Label>
          <Col sm="8" className="">
            <Input
              type="text"
              value={props.testsRowsData.sampleSize}
              onChange={handlechange}
              id="Sample_size"
              name="sampleCount"
              disabled
              max={props.rowData?.meters?.length}
              placeholder={props.rowData?.meters?.length}
            />
          </Col>
        </FormGroup>
        <FormGroup className="mb-0 " row>
          <Col sm="9" className="d-flex" md={{ size: 9, offset: 3 }}>
            <Button.Ripple
              color="primary"
              type="submit"
              className="btn-next  w-25"
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="sm" /> : 'Submit'}
            </Button.Ripple>
          </Col>
        </FormGroup>
      </Form>
    </>
  );
};

export default CopyTestConfig;

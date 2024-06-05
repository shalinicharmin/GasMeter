import { useRef, useState } from 'react';
import Wizard from '@components/wizard';
import { FileText, User, MapPin, Link } from 'react-feather';
import CreateSatProject from './createSatProject';
import ConfigureSat from './configureSat';

const Sat = (props) => {
  const [stepper, setStepper] = useState(null);
  const [row, setRow] = useState({});

  // const [first, setfirst] = useState(second)

  const ref = useRef(null);

  const steps = [
    {
      id: 'test-cycle',
      title: 'Test Cycles ',
      // subtitle: "Project Creation",
      icon: <FileText size={18} />,
      content: (
        <CreateSatProject
          stepper={stepper}
          setRow={setRow}
          type="wizard-horizontal"
        />
      ),
      onClick: () => {
        stepper.previous();
      },
    },
    {
      id: 'text-config',
      title: 'Tests',
      // subtitle: "Details of Project",
      icon: <User size={18} />,
      content: (
        <ConfigureSat stepper={stepper} row={row} type="wizard-horizontal" />
      ),
    },
  ];

  return (
    <>
      <h4> SAT</h4>
      <div className="horizontal-wizard ">
        <Wizard ref={ref} steps={steps} instance={(el) => setStepper(el)} />
      </div>
    </>
  );
};

export default Sat;

import React from 'react';
import { Transition } from '..';
import { render } from '@testing-library/react';

describe('<Transition/', () => {
    it('Doesn\'t render a damn thing', () => {
        const { container } = render(<Transition event='test-event' target='test-target'/>);
        expect(container.firstChild).toBeNull();
    });
});
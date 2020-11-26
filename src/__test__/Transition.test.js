import React from 'react';
import { Transition } from '..';
import { cleanup, render } from '@testing-library/react';

describe('<Transition/', () => {
    afterEach(cleanup);

    it('Doesn\'t render a dang thing', () => {
        const { container } = render(<Transition event='test-event' target='test-target'/>);
        expect(container.firstChild).toBeNull();
    });
});
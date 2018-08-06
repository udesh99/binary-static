import PropTypes    from 'prop-types';
import React        from 'react';
import ToggleButton from '../toggle_button.jsx';

const DrawerToggle = ({
    text,
    to_toggle,
    toggle,
}) => (
    <div className='drawer-item__toggle' onClick={toggle}>
        <span>{text}</span>
        <ToggleButton
            toggled={to_toggle}
        />
    </div>
    );

DrawerToggle.propTypes = {
    text     : PropTypes.string,
    toggle   : PropTypes.func,
    to_toggle: PropTypes.bool,
};

export { DrawerToggle };

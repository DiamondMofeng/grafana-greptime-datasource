import React from 'react';
import { Tooltip, Button } from "@grafana/ui";

type Props = {
  onRemove: () => void;
  children: JSX.Element,
}

/**
 * TODO: Currently only support warpping one component.
 */
export const RemoveablePopover = (props: Props) => {

  const { children, onRemove } = props;

  const DeleteButton = () => {
    return (
      <Button
        onClick={onRemove}
        variant='destructive'
        size='sm'
      >
        Remove
      </Button>
    )
  }

  return (
    <>
      <Tooltip
        interactive
        content={DeleteButton}
        // WARNING SHIT CODE 
        //      you should know that, if you lose focus on this tooltip, 
        //      it will not disapper even if your pointer is not hover on it's children.
        //      Now I place it in the bottom of children, so it would be coverd by the select component.
        placement="bottom-start"
      >
        <span>
          {children}
        </span>
      </Tooltip>
    </>
  )
}


